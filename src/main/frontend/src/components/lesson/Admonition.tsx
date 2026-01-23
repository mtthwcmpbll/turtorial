import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type AdmonitionType = 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION' | 'note' | 'tip' | 'important' | 'warning' | 'caution';

interface AdmonitionProps {
    type: AdmonitionType;
    title?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export default function Admonition({ type, title, children, className }: AdmonitionProps) {
    const normalizedType = type.toUpperCase();

    let styles = "bg-muted text-foreground border-l-4 p-4 my-4 rounded-r";
    let borderColor = "border-primary"; // Default
    let icon = "ℹ️";
    let defaultTitle = "Note";

    switch (normalizedType) {
        case 'NOTE':
            borderColor = "border-blue-500";
            styles = "bg-blue-50/50 text-blue-900 dark:text-blue-100 border-l-4 p-4 my-4 rounded-r";
            icon = "ℹ️";
            defaultTitle = "Note";
            break;
        case 'TIP':
            borderColor = "border-green-500";
            styles = "bg-green-50/50 text-green-900 dark:text-green-100 border-l-4 p-4 my-4 rounded-r";
            icon = "💡";
            defaultTitle = "Tip";
            break;
        case 'IMPORTANT':
            borderColor = "border-purple-500";
            styles = "bg-purple-50/50 text-purple-900 dark:text-purple-100 border-l-4 p-4 my-4 rounded-r";
            icon = "📢";
            defaultTitle = "Important";
            break;
        case 'WARNING':
            borderColor = "border-yellow-500";
            styles = "bg-yellow-50/50 text-yellow-900 dark:text-yellow-100 border-l-4 p-4 my-4 rounded-r";
            icon = "⚠️";
            defaultTitle = "Warning";
            break;
        case 'CAUTION':
            borderColor = "border-red-500";
            styles = "bg-red-50/50 text-red-900 dark:text-red-100 border-l-4 p-4 my-4 rounded-r";
            icon = "🛑";
            defaultTitle = "Caution";
            break;
    }

    return (
        <div className={twMerge(clsx(`${styles} ${borderColor} relative`, className))} role="alert">
            <div className="font-bold mb-2 flex items-center gap-2">
                <span>{icon}</span>
                <span>{title || defaultTitle}</span>
            </div>
            <div className="text-sm opacity-90">
                {children}
            </div>
        </div>
    );
}
