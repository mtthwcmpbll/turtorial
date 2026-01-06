package com.snowfort.turtorial.terminal;

import com.pty4j.PtyProcess;
import com.pty4j.PtyProcessBuilder;
import com.pty4j.WinSize;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
public class TerminalSocketHandler extends TextWebSocketHandler {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(TerminalSocketHandler.class);

    private final Map<String, PtyProcess> sessions = new ConcurrentHashMap<>();
    private final Map<String, ExecutorService> sessionThreads = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        log.info("WebSocket connection established: " + session.getId());
        long start = System.nanoTime();

        String[] cmd = { "/bin/bash", "-l" };
        Map<String, String> env = new HashMap<>(System.getenv());
        env.put("TERM", "xterm");

        // Optimize Pty4J by specifying a persistent data directory
        String ptyLibPath = System.getProperty("user.home") + "/.pty4j";
        System.setProperty("pty4j.tmpdir", ptyLibPath);

        try {
            log.info("Starting PTY process for session: " + session.getId());
            PtyProcess process = new PtyProcessBuilder(cmd)
                    .setEnvironment(env)
                    .start();

            long ptyStartDuration = (System.nanoTime() - start) / 1_000_000;
            log.info("PTY process started in {} ms for session: {}", ptyStartDuration, session.getId());

            sessions.put(session.getId(), process);

            // Initial window size
            process.setWinSize(new WinSize(80, 24));

            ExecutorService executor = Executors.newSingleThreadExecutor();
            sessionThreads.put(session.getId(), executor);

            executor.submit(() -> {
                InputStream is = process.getInputStream();
                byte[] buffer = new byte[1024];
                int read;
                try {
                    while (process.isAlive() && (read = is.read(buffer)) != -1) {
                        if (session.isOpen()) {
                            // optimize logging: don't log every chunk unless debugging
                            // log.debug("Sent " + read + " bytes to " + session.getId());
                            session.sendMessage(new TextMessage(new String(buffer, 0, read, StandardCharsets.UTF_8)));
                        }
                    }
                } catch (IOException e) {
                    log.error("Error reading from PTY for session " + session.getId(), e);
                } finally {
                    log.info("PTY output stream closed for session " + session.getId());
                }
            });
        } catch (Exception e) {
            log.error("Failed to start PTY process within " + ((System.nanoTime() - start) / 1_000_000) + " ms", e);
            session.close(CloseStatus.SERVER_ERROR);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        PtyProcess process = sessions.get(session.getId());
        if (process != null && process.isAlive()) {
            OutputStream os = process.getOutputStream();
            os.write(message.getPayload().getBytes(StandardCharsets.UTF_8));
            os.flush();
        } else {
            log.warn("Received message but PTY is dead for session: " + session.getId());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        log.info("WebSocket connection closed: " + session.getId());
        PtyProcess process = sessions.remove(session.getId());
        if (process != null && process.isAlive()) {
            process.destroy();
        }
        ExecutorService executor = sessionThreads.remove(session.getId());
        if (executor != null) {
            executor.shutdownNow();
        }
    }
}
