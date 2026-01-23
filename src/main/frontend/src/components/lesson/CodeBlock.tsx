import React from 'react';
import RunButton from './RunButton';

// Helper to extract text from React children
const extractText = (node: any): string => {
    if (!node) return '';
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (typeof node === 'object' && node.props && node.props.children) {
        return extractText(node.props.children);
    }
    return '';
};

interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export default function CodeBlock({ children, className, inline, ...props }: CodeBlockProps) {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const isBash = language === 'bash' || language === 'sh';

    if (inline) {
        return (
            <code {...props} className={className}>
                {children}
            </code>
        );
    }

    const codeContent = extractText(children).replace(/\n$/, '');

    if (isBash) {
        return (
            <div className="relative group my-4">
                <div className="absolute right-2 top-2 z-10 transition-opacity">
                    <RunButton command={codeContent} />
                </div>
                <code {...props} className={className}>
                    {children}
                </code>
            </div>
        );
    }

    return (
        <code {...props} className={className}>
            {children}
        </code>
    );
}
