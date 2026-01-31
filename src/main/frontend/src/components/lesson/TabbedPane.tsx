import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Terminal, Plus, X, Globe } from 'lucide-react';
import TerminalPanel from './TerminalPanel';
import BrowserPanel from './BrowserPanel';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Tab {
    id: string;
    type: 'terminal' | 'browser';
    title: string;
}

export default function TabbedPane() {
    const [tabs, setTabs] = useState<Tab[]>([
        { id: 'term-1', type: 'terminal', title: 'Terminal' }
    ]);
    const [activeTabId, setActiveTabId] = useState('term-1');

    const addTab = (type: 'terminal' | 'browser') => {
        const id = `${type === 'terminal' ? 'term' : 'browser'}-${Date.now()}`;
        const newTab: Tab = {
            id,
            type,
            title: type === 'terminal' ? 'Terminal' : 'Browser'
        };
        setTabs([...tabs, newTab]);
        setActiveTabId(id);
    };

    const removeTab = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);

        if (activeTabId === id && newTabs.length > 0) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
        } else if (newTabs.length === 0) {
             setActiveTabId('');
        }
    };

    return (
        <Tabs.Root
            value={activeTabId}
            onValueChange={setActiveTabId}
            className="flex flex-col h-full w-full bg-[#1e1e1e]"
        >
            <div className="flex items-center border-b border-white/10 bg-[#252526]">
                <Tabs.List className="flex flex-1 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <Tabs.Trigger
                            key={tab.id}
                            value={tab.id}
                            className={cn(
                                "group flex items-center gap-2 px-3 py-2 text-sm text-gray-400 border-r border-white/5 select-none cursor-pointer min-w-[120px] justify-between",
                                "hover:bg-[#2a2d2e] hover:text-gray-200",
                                "data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white data-[state=active]:border-t-2 data-[state=active]:border-t-blue-500",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 inset-ring"
                            )}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                {tab.type === 'terminal' ? <Terminal size={14} className="shrink-0" /> : <Globe size={14} className="shrink-0" />}
                                <span className="truncate">{tab.title}</span>
                            </div>
                            <div
                                role="button"
                                className="ml-1 rounded-sm p-0.5 opacity-0 group-hover:opacity-100 hover:bg-white/20 text-gray-500 hover:text-white transition-all"
                                onClick={(e) => removeTab(tab.id, e)}
                            >
                                <X size={12} />
                            </div>
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>

                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button
                            className="flex items-center justify-center h-full px-3 text-gray-400 hover:text-white hover:bg-[#2a2d2e] border-l border-white/5 transition-colors focus:outline-none"
                            title="New Tab"
                        >
                            <Plus size={16} />
                        </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            className="min-w-[160px] bg-[#252526] rounded-md border border-white/10 shadow-lg p-1 z-50 text-sm"
                            sideOffset={5}
                            align="end"
                        >
                            <DropdownMenu.Item
                                className="flex items-center gap-2 px-2 py-1.5 text-gray-200 rounded hover:bg-[#094771] hover:text-white outline-none cursor-pointer"
                                onSelect={() => addTab('terminal')}
                            >
                                <Terminal size={14} />
                                <span>Terminal</span>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                className="flex items-center gap-2 px-2 py-1.5 text-gray-200 rounded hover:bg-[#094771] hover:text-white outline-none cursor-pointer"
                                onSelect={() => addTab('browser')}
                            >
                                <Globe size={14} />
                                <span>Browser</span>
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>

            <div className="flex-1 relative min-h-0">
                {tabs.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                        <p>No open tabs</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => addTab('terminal')}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Open Terminal
                            </button>
                            <button
                                onClick={() => addTab('browser')}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                                Open Browser
                            </button>
                        </div>
                     </div>
                )}
                {tabs.map((tab) => (
                    <Tabs.Content
                        key={tab.id}
                        value={tab.id}
                        forceMount
                        className="h-full w-full data-[state=inactive]:hidden"
                    >
                         {tab.type === 'terminal' && <TerminalPanel />}
                         {tab.type === 'browser' && <BrowserPanel />}
                    </Tabs.Content>
                ))}
            </div>
        </Tabs.Root>
    );
}
