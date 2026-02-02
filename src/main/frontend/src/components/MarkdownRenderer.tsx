import React from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import 'highlight.js/styles/github-dark.css';

import CodeBlock from './lesson/CodeBlock';
import Admonition, { type AdmonitionType } from './lesson/Admonition';

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

                    data.hName = tagName;
                    data.hProperties = {
                        className: "admonition-wrapper",
                        "data-admonition-type": node.name,
                        "data-admonition-title": (node.attributes && node.attributes.title) ? node.attributes.title : undefined,
                    };
                }
            }
        });
    };
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    // Pre-process content to support ":::note Title" syntax by converting it to ":::note{title="Title"}"
    const normalizedContent = content.replace(/^:::(note|tip|warning|important|caution)\s+(.+)$/gm, ':::$1{title="$2"}');

    return (
        <div className="w-full min-w-0 break-words">
            <Markdown
                remarkPlugins={[remarkGfm, remarkDirective, remarkAdmonitions]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    // Custom rendering for pre tags to ensure scrolling
                    pre: ({ children, node, ...props }) => (
                        <pre {...props} className="overflow-x-auto w-full max-w-full rounded-sm bg-transparent !p-0 !m-0">
                            {children}
                        </pre>
                    ),
                    // Custom rendering for code blocks
                    code(props) {
                        return <CodeBlock {...props} />;
                    },
                    // Custom rendering for directives (Admonitions)
                    div: ({ node, className, children, ...props }) => {
                        const type = props['data-admonition-type' as keyof typeof props] as string;
                        if (type) {
                            const title = props['data-admonition-title' as keyof typeof props] as string;
                            return (
                                // Cast type to AdmonitionType because we know it's one of the allowed strings if logic allows
                                <Admonition type={type as AdmonitionType} title={title}>
                                    {children}
                                </Admonition>
                            );
                        }
                        return <div className={className} {...props}>{children}</div>;
                    },

                    // Custom rendering for links to support opening in internal browser
                    a: ({ node, ...props }) => {
                        const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                            const href = props.href;
                            if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                                e.preventDefault();
                                window.dispatchEvent(new CustomEvent('browser:open', { detail: href }));
                            }
                        };
                        return <a {...props} onClick={handleClick} className="text-blue-500 hover:underline cursor-pointer" />;
                    },

                    // Custom rendering for blockquotes to support GitHub Alerts (e.g. > [!NOTE])
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
                            const type = alertData.type as AdmonitionType;

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
                                <Admonition type={type}>
                                    {processedChildren}
                                </Admonition>
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
