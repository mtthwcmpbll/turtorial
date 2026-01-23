import type { Meta, StoryObj } from '@storybook/react';
import ContentHeader from './ContentHeader';

const meta = {
    title: 'Lesson/ContentHeader',
    component: ContentHeader,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        onPrev: { action: 'prev' },
        onNext: { action: 'next' },
    },
} satisfies Meta<typeof ContentHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        stepIndex: 1,
        totalSteps: 5,
        title: 'Navigating Filesystems',
        onPrev: () => { },
        onNext: () => { },
    },
};

export const FirstStep: Story = {
    args: {
        stepIndex: 0,
        totalSteps: 5,
        title: 'Introduction',
        onPrev: () => { },
        onNext: () => { },
    },
};

export const LastStep: Story = {
    args: {
        stepIndex: 4,
        totalSteps: 5,
        title: 'Conclusion',
        onPrev: () => { },
        onNext: () => { },
    },
};
