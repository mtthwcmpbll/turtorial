import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { Save, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface EditorPanelProps {
    initialPath?: string;
}

export default function EditorPanel({ initialPath }: EditorPanelProps) {
    const [path, setPath] = useState(initialPath || '');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const editorRef = useRef<any>(null);

    // Effect to update path if prop changes (though usually initialPath is static for a tab instance)
    useEffect(() => {
        if (initialPath) {
            setPath(initialPath);
        }
    }, [initialPath]);

    useEffect(() => {
        if (!path) return;

        const fetchContent = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/files/content?path=${encodeURIComponent(path)}`);
                if (response.status === 404) {
                    // File doesn't exist, start empty or handle as new file
                    // For now, treat as empty new file but warn
                    // setContent('');
                    // actually if 404, maybe we should let user create it on save.
                    // But if it's "edit specific file", it might be expected to exist.
                    // Let's assume it might not exist yet.
                    console.log('File not found, starting empty');
                } else if (!response.ok) {
                    throw new Error(`Failed to load file: ${response.statusText}`);
                } else {
                    const text = await response.text();
                    setContent(text);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
    }, [path]);

    const handleSave = useCallback(async () => {
        if (!path) return;
        setIsSaving(true);
        setError(null);
        try {
            const currentContent = editorRef.current?.getValue() || content;
            const response = await fetch(`/api/files/content?path=${encodeURIComponent(path)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: currentContent,
            });

            if (!response.ok) {
                throw new Error(`Failed to save file: ${response.statusText}`);
            }
            console.log('File saved successfully');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    }, [path, content]);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;

        // Add Ctrl+S / Cmd+S keybinding
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            handleSave();
        });
    };

    // Determine language based on extension
    const getLanguage = (filePath: string) => {
        const ext = filePath.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'js': return 'javascript';
            case 'ts': return 'typescript';
            case 'jsx': return 'javascript';
            case 'tsx': return 'typescript';
            case 'html': return 'html';
            case 'css': return 'css';
            case 'json': return 'json';
            case 'md': return 'markdown';
            case 'py': return 'python';
            case 'java': return 'java';
            case 'c': return 'c';
            case 'cpp': return 'cpp';
            case 'sh': return 'shell';
            case 'yaml': case 'yml': return 'yaml';
            case 'xml': return 'xml';
            case 'sql': return 'sql';
            default: return 'plaintext';
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#1e1e1e] text-white">
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/10 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                    <span className="font-mono text-xs">{path || 'Untitled'}</span>
                    {isLoading && <Loader2 className="animate-spin h-3 w-3" />}
                </div>
                <div className="flex items-center gap-2">
                    {error && <span className="text-red-400 text-xs">{error}</span>}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading || !path}
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                            isSaving ? "text-blue-400" : "text-gray-300"
                        )}
                        title="Save (Ctrl+S)"
                    >
                        {isSaving ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <Save size={14} />}
                        <span>Save</span>
                    </button>
                </div>
            </div>
            <div className="flex-1 min-h-0 relative">
                <Editor
                    height="100%"
                    defaultLanguage="plaintext"
                    language={getLanguage(path)}
                    value={content}
                    theme="vs-dark"
                    onChange={(value) => setContent(value || '')}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: 'on',
                        padding: { top: 10 },
                    }}
                />
            </div>
        </div>
    );
}
