import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';
import TabbedPane from './TabbedPane';
import React from 'react';

// Mock TerminalPanel to avoid xterm setup
vi.mock('./TerminalPanel', () => ({
  default: () => <div data-testid="terminal-panel">Terminal Content</div>
}));

// Mock BrowserPanel
vi.mock('./BrowserPanel', () => ({
  default: () => <div data-testid="browser-panel">Browser Content</div>
}));

// Mock DropdownMenu to avoid Radix UI Context/React version issues in tests
vi.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Trigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Item: ({ children, onSelect }: { children: React.ReactNode; onSelect?: () => void }) => (
    <div role="menuitem" onClick={onSelect}>
      {children}
    </div>
  ),
}));

describe('TabbedPane', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2024, 1, 1));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders with one initial terminal', () => {
    render(<TabbedPane />);
    expect(screen.getAllByTestId('terminal-panel')).toHaveLength(1);
    // Tab title
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(1);
    expect(tabs[0].textContent).toContain('Terminal');
  });

  it('adds a new terminal when + is clicked and Terminal is selected', () => {
    render(<TabbedPane />);
    // Open menu (mock renders it always, but good to keep structure)
    // fireEvent.click(screen.getByTitle('New Tab'));

    const terminalItem = screen.getAllByText('Terminal').find(el => el.closest('[role="menuitem"]'));
    if (!terminalItem) throw new Error("Terminal menu item not found");

    fireEvent.click(terminalItem);

    expect(screen.getAllByTestId('terminal-panel')).toHaveLength(2);
    expect(screen.getAllByRole('tab')).toHaveLength(2);
  });

  it('adds a new browser when + is clicked and Browser is selected', () => {
    render(<TabbedPane />);
    // fireEvent.click(screen.getByTitle('New Tab'));

    const browserItem = screen.getAllByText('Browser').find(el => el.closest('[role="menuitem"]'));
    if (!browserItem) throw new Error("Browser menu item not found");

    fireEvent.click(browserItem);

    expect(screen.getAllByTestId('browser-panel')).toHaveLength(1);
    expect(screen.getAllByRole('tab')).toHaveLength(2);
  });

  it('removes a terminal when X is clicked', () => {
    render(<TabbedPane />);

    const terminalItem = screen.getAllByText('Terminal').find(el => el.closest('[role="menuitem"]'));
    if (!terminalItem) throw new Error("Terminal menu item not found");
    fireEvent.click(terminalItem);

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);

    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find(btn =>
      btn.getAttribute('title') !== 'New Tab' &&
      btn.closest('[role="tab"]')
    );

    if (!closeButton) throw new Error('Close button not found');

    fireEvent.click(closeButton);

    expect(screen.getAllByRole('tab')).toHaveLength(1);
  });
  it('handles browser:open event', async () => {
    render(<TabbedPane />);

    // Simulate browser:open event
    const event = new CustomEvent('browser:open', { detail: 'https://example.com' });

    await act(async () => {
      window.dispatchEvent(event);
    });

    // Should added a browser tab - wait for state update
    await waitFor(() => {
      expect(screen.getAllByRole('tab')).toHaveLength(2);
      expect(screen.getByRole('tab', { name: /Browser/i })).toBeDefined();
    });
  });

  it('handles terminal:run-command event', async () => {
    render(<TabbedPane />);

    // Simulate run command
    const event = new CustomEvent('terminal:run-command', { detail: 'echo hello' });
    window.dispatchEvent(event);

    // Should reuse existing terminal tab (initially 1)
    await waitFor(() => {
      expect(screen.getAllByRole('tab')).toHaveLength(1);
    });
  });

  it('handles terminal:run-command event by creating new tab if none exists', async () => {
    render(<TabbedPane initialTabs={[]} />);

    expect(screen.queryByRole('tab')).toBeNull();

    // Simulate run command
    const event = new CustomEvent('terminal:run-command', { detail: 'echo hello' });

    await act(async () => {
      window.dispatchEvent(event);
    });

    // Should create a new terminal tab
    await waitFor(() => {
      expect(screen.getAllByRole('tab')).toHaveLength(1);
      expect(screen.getByRole('tab', { name: /Terminal/i })).toBeDefined();
    });
  });

  it('prevents duplicate tabs from rapid events (guardrail)', async () => {
    render(<TabbedPane initialTabs={[]} />);

    const event = new CustomEvent('terminal:run-command', { detail: 'echo hello' });

    // Dispatch twice rapidly (simulating strict mode or rapid user action with frozen time)
    await act(async () => {
      window.dispatchEvent(event);
      window.dispatchEvent(event);
    });

    // Should still only create ONE tab due to dedup logic
    await waitFor(() => {
      expect(screen.getAllByRole('tab')).toHaveLength(1);
    });
  });
});
