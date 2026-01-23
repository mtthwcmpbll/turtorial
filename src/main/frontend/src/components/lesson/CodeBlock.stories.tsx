import type { Meta, StoryObj } from '@storybook/react';
import CodeBlock from './CodeBlock';

import 'highlight.js/styles/github-dark.css';

const meta = {
    title: 'Lesson/CodeBlock',
    component: CodeBlock,
    tags: ['autodocs'],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bash: Story = {
    args: {
        className: 'language-bash hljs',
        children: 'echo "Hello from Terminal"',
    },
    decorators: [
        (Story) => (
            <pre className="overflow-x-auto w-full max-w-full rounded-sm bg-transparent !p-0 !m-0">
                <Story />
            </pre>
        ),
    ],
};

export const TypeScript: Story = {
    args: {
        className: 'language-typescript hljs',
        children: 'const x: number = 42;',
    },
    decorators: [
        (Story) => (
            <pre className="overflow-x-auto w-full max-w-full rounded-sm bg-transparent !p-0 !m-0">
                <Story />
            </pre>
        ),
    ],
};

export const Inline: Story = {
    args: {
        inline: true,
        children: 'npm install',
    },
};
