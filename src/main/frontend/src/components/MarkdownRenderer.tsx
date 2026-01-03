import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import 'highlight.js/styles/github-dark.css';
import React from 'react';

interface MarkdownRendererProps {
    content: string;
}

// Plugin to process directive nodes (e.g. :::note)
function remarkAdmonitions() {
    return (tree: any) => {
        visit(tree, (node) => {
            if (node.type === 'containerDirective') {
                if (['note', 'tip', 'warning', 'important', 'caution'].includes(node.name)) {
                    const data = node.data || (node.data = {});
                    const tagName = 'div';

                    // Define styles based on type
                    let styles = "bg-muted text-foreground border-l-4 p-4 my-4 rounded-r relative";
                    let borderColor = "border-primary";
                    let icon = "ℹ️";

                    switch (node.name) {
                        case 'note':
                            borderColor = "border-blue-500";
                            styles = "bg-blue-50/50 text-blue-900 dark:text-blue-100 border-l-4 p-4 my-4 rounded-r relative";
                            icon = "ℹ️";
                            break;
                        case 'tip':
                            borderColor = "border-green-500";
                            styles = "bg-green-50/50 text-green-900 dark:text-green-100 border-l-4 p-4 my-4 rounded-r relative";
                            icon = "💡";
                            break;
                        case 'important':
                            borderColor = "border-purple-500";
                            styles = "bg-purple-50/50 text-purple-900 dark:text-purple-100 border-l-4 p-4 my-4 rounded-r relative";
                            icon = "📢";
                            break;
                        case 'warning':
                            borderColor = "border-yellow-500";
                            styles = "bg-yellow-50/50 text-yellow-900 dark:text-yellow-100 border-l-4 p-4 my-4 rounded-r relative";
                            icon = "⚠️";
                            break;
                        case 'caution':
                            borderColor = "border-red-500";
                            styles = "bg-red-50/50 text-red-900 dark:text-red-100 border-l-4 p-4 my-4 rounded-r relative";
                            icon = "🛑";
                            break;
                    }

                    data.hName = tagName;
                    data.hProperties = {
                        className: `${styles} ${borderColor} admonition admonition-${node.name}`,
                    };

                    // Inject a title element if one doesn't exist in a structured way
                    // Use a custom data structure for the title to be rendered as a div
                    const titleText = (node.attributes && node.attributes.title) ? node.attributes.title : node.name.toUpperCase();

                    // Injecting title node:
                    const titleParagraph = {
                        type: 'paragraph',
                        data: { hProperties: { className: 'font-bold mb-2 flex items-center gap-2' } },
                        children: [
                            { type: 'text', value: icon },
                            { type: 'text', value: ' ' + titleText }
                        ]
                    };

                    node.children.unshift(titleParagraph);
                }
            }
        });
    };
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    // Pre-process content to support ":::note Title" syntax by converting it to ":::note{title="Title"}"
    // This maintains compatibility with Docusaurus-style admonitions while using standard remark-directive
    const normalizedContent = content.replace(/^:::(note|tip|warning|important|caution)\s+(.+)$/gm, ':::$1{title="$2"}');

    return (
        <div className="w-full min-w-0 break-words">
            <Markdown
                remarkPlugins={[remarkGfm, remarkDirective, remarkAdmonitions]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    // Custom rendering for pre tags to ensure scrolling
                    pre: ({ children, node, ...props }) => (
                        <pre {...props} className="overflow-x-auto w-full max-w-full rounded-sm">
                            {children}
                        </pre>
                    ),
                    // Custom rendering for code blocks
                    code(props) {
                        const { children, className, node, ...rest } = props
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
                                    <div className="absolute right-2 top-2">
                                        <button
                                            onClick={() => window.dispatchEvent(new CustomEvent('terminal:input', { detail: codeContent + '\r' }))}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded shadow-md flex items-center space-x-1"
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
                    },
                    // Custom rendering for blockquotes to support GitHub Alerts
                    blockquote: ({ children, node, ...props }) => {
                        // Helper to find the alert type from the first paragraph
                        const findAlertType = (content: React.ReactNode): { type: string | null; warning?: boolean } => {
                            if (!content || !Array.isArray(content)) return { type: null };

                            // Look for the paragraph that might contain the alert marker
                            const firstChild = content[0];
                            if (typeof firstChild === 'object' && firstChild !== null && 'props' in firstChild) {
                                const childProps = (firstChild as any).props;
                                if (childProps && childProps.children) {
                                    const textContent = childProps.children;
                                    if (typeof textContent === 'string' && textContent.startsWith('[!')) {
                                        const match = textContent.match(/^\[!(\w+)\]/);
                                        if (match) {
                                            return { type: match[1].toUpperCase() };
                                        }
                                    }
                                }
                            }
                            return { type: null };
                        };

                        const alertData = findAlertType(children);

                        if (alertData.type) {
                            const type = alertData.type;
                            let styles = "bg-muted text-foreground border-l-4 p-4 my-4 rounded-r";
                            let borderColor = "border-primary"; // Default (NOTE)
                            let icon = "ℹ️";

                            switch (type) {
                                case 'NOTE':
                                    borderColor = "border-blue-500";
                                    styles = "bg-blue-50/50 text-blue-900 dark:text-blue-100 border-l-4 p-4 my-4 rounded-r";
                                    icon = "ℹ️";
                                    break;
                                case 'TIP':
                                    borderColor = "border-green-500";
                                    styles = "bg-green-50/50 text-green-900 dark:text-green-100 border-l-4 p-4 my-4 rounded-r";
                                    icon = "💡";
                                    break;
                                case 'IMPORTANT':
                                    borderColor = "border-purple-500";
                                    styles = "bg-purple-50/50 text-purple-900 dark:text-purple-100 border-l-4 p-4 my-4 rounded-r";
                                    icon = "📢";
                                    break;
                                case 'WARNING':
                                    borderColor = "border-yellow-500";
                                    styles = "bg-yellow-50/50 text-yellow-900 dark:text-yellow-100 border-l-4 p-4 my-4 rounded-r";
                                    icon = "⚠️";
                                    break;
                                case 'CAUTION':
                                    borderColor = "border-red-500";
                                    styles = "bg-red-50/50 text-red-900 dark:text-red-100 border-l-4 p-4 my-4 rounded-r";
                                    icon = "🛑";
                                    break;
                            }

                            // Remove the [!NOTE] text from the first paragraph
                            const processedChildren = React.Children.map(children, (child, index) => {
                                if (index === 0 && React.isValidElement(child)) {
                                    const childProps = (child as any).props;
                                    if (childProps && typeof childProps.children === 'string') {
                                        const text = childProps.children;
                                        const match = text.match(/^\[!(\w+)\]/);
                                        if (match) {
                                            return React.cloneElement(child, {
                                                ...(child.props as any),
                                                children: text.substring(match[0].length).trim() || <br />
                                            });
                                        }
                                    }
                                }
                                return child;
                            });

                            return (
                                <div className={`${styles} ${borderColor} relative`} role="alert">
                                    <div className="font-bold mb-2 flex items-center gap-2">
                                        <span>{icon}</span>
                                        <span>{type}</span>
                                    </div>
                                    <div className="text-sm opacity-90">
                                        {processedChildren}
                                    </div>
                                </div>
                            );
                        }

                        // Default blockquote
                        return (
                            <blockquote {...props} className="border-l-4 border-border pl-4 italic text-muted-foreground my-4">
                                {children}
                            </blockquote>
                        );
                    }
                }}
            >
                {normalizedContent}
            </Markdown>
        </div>
    );
}
