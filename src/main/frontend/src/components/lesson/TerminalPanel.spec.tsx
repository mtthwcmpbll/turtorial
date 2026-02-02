import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import TerminalPanel from './TerminalPanel';

// Mock WebSocket
const mockSend = vi.fn();
const mockClose = vi.fn();

class MockWebSocket {
    send = mockSend;
    close = mockClose;
    readyState = WebSocket.OPEN;
    url: string;
    constructor(url: string) {
        this.url = url;
        setTimeout(() => {
            if (this.onopen) {
                this.onopen(new Event('open'));
            }
        }, 0);
    }
    onopen: ((e: Event) => void) | null = null;
    onmessage: ((e: MessageEvent) => void) | null = null;
    onclose: ((e: CloseEvent) => void) | null = null;
    onerror: ((e: Event) => void) | null = null;
}

describe('TerminalPanel', () => {
    let originalWebSocket: any;

    beforeEach(() => {
        originalWebSocket = window.WebSocket;
        window.WebSocket = MockWebSocket as any;
        vi.clearAllMocks();
    });

    afterEach(() => {
        window.WebSocket = originalWebSocket;
    });

    it('should send \\t when Tab is pressed', async () => {
        const user = userEvent.setup();
        const { container } = render(<TerminalPanel />);

        // Wait for terminal to be ready
        await new Promise(r => setTimeout(r, 500));

        // Find the terminal textarea
        const textarea = container.querySelector('textarea.xterm-helper-textarea');
        if (!textarea) throw new Error('xterm textarea not found');

        // Click to focus
        await user.click(textarea);

        // Press Tab
        await user.keyboard('{Tab}');

        await new Promise(r => setTimeout(r, 100));

        expect(mockSend).toHaveBeenCalledWith('\t');
    });
});
