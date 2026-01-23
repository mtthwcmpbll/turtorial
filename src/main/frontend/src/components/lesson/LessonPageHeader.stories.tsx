import type { Meta, StoryObj } from '@storybook/react';
import LessonPageHeader from './LessonPageHeader';

const meta = {
    title: 'Lesson/LessonPageHeader',
    component: LessonPageHeader,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        onBack: { action: 'back clicked' },
    },
} satisfies Meta<typeof LessonPageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Introduction to Linux',
        onBack: () => { },
    },
};

export const LongTitle: Story = {
    args: {
        title: 'Advanced Shell Scripting and Automation with Complex Scenarios',
        onBack: () => { },
    },
};
