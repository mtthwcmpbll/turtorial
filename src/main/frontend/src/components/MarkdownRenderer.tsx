import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
    content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <div className="prose prose-invert max-w-none p-6">
            <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    // Custom rendering for code blocks
                    code(props) {
                        const { children, className, ...rest } = props
                        const match = /language-(\w+)/.exec(className || '')
                        const language = match ? match[1] : ''
                        const isBash = language === 'bash' || language === 'sh'

                        // Helper to extract text from React children (handles syntax highlighting nodes)
                        const extractText = (node: any): string => {
                            if (!node) return '';
                            if (typeof node === 'string') return node;
                            if (Array.isArray(node)) return node.map(extractText).join('');
                            if (typeof node === 'object' && node.props && node.props.children) {
                                return extractText(node.props.children);
                            }
                            return '';
                        };

                        const codeContent = extractText(children).replace(/\n$/, '');

                        if (isBash) {
                            return (
                                <div className="relative group">
                                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => window.dispatchEvent(new CustomEvent('terminal:input', { detail: codeContent + '\r' }))}
                                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-md flex items-center space-x-1"
                                            title="Run in Terminal"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <span>Run</span>
                                        </button>
                                    </div>
                                    <code {...rest} className={className}>
                                        {children}
                                    </code>
                                </div>
                            )
                        }

                        return match ? (
                            <code {...rest} className={className}>
                                {children}
                            </code>
                        ) : (
                            <code {...rest} className={className}>
                                {children}
                            </code>
                        )
                    }
                }}
            >
                {content}
            </Markdown>
        </div>
    );
}
