package com.snowfort.turtorial.terminal;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class TerminalConfig implements WebSocketConfigurer {

    private final TerminalSocketHandler terminalSocketHandler;

    public TerminalConfig(TerminalSocketHandler terminalSocketHandler) {
        this.terminalSocketHandler = terminalSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(terminalSocketHandler, "/term")
                .setAllowedOrigins("*");
    }
}
