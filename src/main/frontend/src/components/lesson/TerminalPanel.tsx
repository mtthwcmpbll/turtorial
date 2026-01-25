import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export default function TerminalPanel() {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!terminalRef.current) return;

        // Initialize xterm
        const term = new Terminal({
            cursorBlink: true,
            theme: {
                background: '#1e1e1e',
                foreground: '#f0f0f0',
            },
            fontFamily: '"Cascadia Code", "Fira Code", monospace',
        });

        // Handle custom key events (e.g. Tab for completion)
        term.attachCustomKeyEventHandler((event) => {
            if (event.code === 'Tab') {
                event.preventDefault(); // Prevent browser focus switch
                return true; // Allow xterm to process the key
            }
            return true;
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);
        fitAddon.fit();
        xtermRef.current = term;

        // Connect WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/term`;

        console.log("Connecting to terminal: " + wsUrl);

        let ws: WebSocket | null = null;
        try {
            ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("WS Connected");
                term.writeln('\x1b[32mConnected to terminal backend...\x1b[0m\r\n');
            };

            ws.onerror = (e) => {
                console.error("WS Error", e);
                term.writeln('\r\n\x1b[31mConnection Error (Is backend running?).\x1b[0m');
            };

            ws.onmessage = (event) => {
                console.log("WS Message received (length):", event.data.length);
                term.write(event.data);
            };

            ws.onclose = (e) => {
                console.log("WS Closed", e.code, e.reason);
                term.writeln('\r\n\x1b[31mConnection closed.\x1b[0m');
            };

            term.onData((data) => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(data);
                }
            });

        } catch (err) {
            console.error("Failed to create WebSocket", err);
            term.writeln('\r\n\x1b[31mWebSocket init failed.\x1b[0m');
        }

        // Custom event to send text to terminal programmatically
        const handleInput = (e: Event) => {
            const customEvent = e as CustomEvent;
            // Check wsRef.current instead of closure variable to get latest if needed, 
            // though effect runs once so closure 'ws' matches 'wsRef.current' if successful.
            // Safe to use wsRef.current
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(customEvent.detail);
                xtermRef.current?.focus();
            } else {
                console.warn("Cannot send input, WS not open");
            }
        };
        window.addEventListener('terminal:input', handleInput);

        // Use ResizeObserver to fit terminal when container resizes
        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                if (term) {
                    fitAddon.fit();
                }
            });
        });

        if (terminalRef.current) {
            resizeObserver.observe(terminalRef.current);
        }

        // Force fit after slight delay
        setTimeout(() => {
            fitAddon.fit();
        }, 100);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('terminal:input', handleInput);
            wsRef.current?.close();
            term.dispose();
        };
    }, []);

    return (
        <div className="h-full w-full p-6 bg-[#1e1e1e] box-border relative overflow-hidden">
            <div ref={terminalRef} className="h-full w-full" style={{ minHeight: '400px' }} />
        </div>
    );
}
