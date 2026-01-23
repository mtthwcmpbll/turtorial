import type { Meta, StoryObj } from '@storybook/react';
import ContentPanel from './ContentPanel';
import type { Lesson } from '../../types';

const meta = {
    title: 'Lesson/ContentPanel',
    component: ContentPanel,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        onPrev: { action: 'prev' },
        onNext: { action: 'next' },
        onSelectStep: { action: 'select step' },
        onRunCommand: { action: 'run command' },
    },
    decorators: [
        (Story) => (
            <div className="h-screen w-full">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ContentPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockLesson: Lesson = {
    id: '1',
    title: 'Linux Basics',
    steps: [
        {
            id: '1-1', title: 'Introduction', content: '# Intro\n\nWelcome to Linux.', runCommand: 'echo "hello"'
        },
        {
            id: '1-2', title: 'Listing Files', content: '# ls Command\n\nUse ls to list files.', runCommand: 'ls -la'
        },
    ],
};

export const Default: Story = {
    args: {
        lesson: mockLesson,
        stepIndex: 0,
        completedSteps: new Set(),
        onPrev: () => { },
        onNext: () => { },
        onSelectStep: () => { },
        onRunCommand: () => { },
    },
};
