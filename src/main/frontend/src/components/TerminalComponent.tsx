import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export default function TerminalComponent() {
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

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);
        fitAddon.fit();
        xtermRef.current = term;

        // Connect WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Use relative path which will be proxied or direct if port matches
        // But in dev, Vite is 5173, Boot is 8080. 
        // We configured proxy? Not yet. 
        // We will assume /term is proxied.
        const host = window.location.host; 
        const wsUrl = `${protocol}//${host}/term`;
        
        console.log("Connecting to terminal: " + wsUrl);

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            term.writeln('\x1b[32mConnected to terminal backend...\x1b[0m\r\n');
        };

        ws.onmessage = (event) => {
            term.write(event.data);
        };

        ws.onclose = () => {
            term.writeln('\r\n\x1b[31mConnection closed.\x1b[0m');
        };

        term.onData((data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            }
        });

        const handleResize = () => fitAddon.fit();
        window.addEventListener('resize', handleResize);

        // Custom event to send text to terminal programmatically
        const handleInput = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(customEvent.detail);
                xtermRef.current?.focus();
            }
        };
        window.addEventListener('terminal:input', handleInput);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('terminal:input', handleInput);
            ws.close();
            term.dispose();
        };
    }, []);

    return (
        <div className="h-full w-full p-6 bg-[#1e1e1e] box-border relative overflow-hidden">
             {/* Wrapper to ensure full height for xterm */}
            <div ref={terminalRef} className="h-full w-full" style={{ minHeight: '400px' }} />
        </div>
    );
}
