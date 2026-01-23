import type { Meta, StoryObj } from '@storybook/react';
import ContentSection from './ContentSection';

const meta = {
    title: 'Lesson/ContentSection',
    component: ContentSection,
    tags: ['autodocs'],
    argTypes: {
        onRunCommand: { action: 'run command' },
    },
    decorators: [
        (Story) => (
            <div className="h-[500px] border border-border">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ContentSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMarkdown = `
# Welcome to the Shell

The shell is a command-line interface (CLI) that allows you to interact with your computer's operating system.

## Basic Commands

Here are some basic commands:

- \`ls\`: List files
- \`cd\`: Change directory

:::note
This is a note about the shell.
:::

\`\`\`bash
echo "Hello World"
\`\`\`
`;

export const Default: Story = {
    args: {
        content: sampleMarkdown,
        runCommand: 'ls -la',
        onRunCommand: () => { },
    },
};

export const NoRunCommand: Story = {
    args: {
        content: sampleMarkdown,
        onRunCommand: () => { },
    },
};
