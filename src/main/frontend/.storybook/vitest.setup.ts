import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);

// Mock WebSocket globally for tests to avoid network connection attempts
class MockWebSocket {
  url: string;
  onopen: ((this: WebSocket, ev: Event) => any) | null = null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
  onerror: ((this: WebSocket, ev: Event) => any) | null = null;
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
  readyState = 1; // WebSocket.OPEN

  constructor(url: string) {
    this.url = url;
    setTimeout(() => this.onopen?.(new Event('open')), 0);
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView) { this.readyState = 1; }
  close(code?: number, reason?: string) { }
  addEventListener() { }
  removeEventListener() { }

  // Implement missing properties from WebSocket interface
  binaryType: BinaryType = 'blob';
  bufferedAmount = 0;
  extensions = '';
  protocol = '';
  dispatchEvent(event: Event): boolean { return true; }
  readonly CLOSED = 3;
  readonly CLOSING = 2;
  readonly CONNECTING = 0;
  readonly OPEN = 1;
}

// @ts-ignore
globalThis.WebSocket = MockWebSocket;