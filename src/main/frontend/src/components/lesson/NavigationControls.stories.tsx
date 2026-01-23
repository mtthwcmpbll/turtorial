import type { Meta, StoryObj } from '@storybook/react';
import NavigationControls from './NavigationControls';

const meta = {
    title: 'Lesson/NavigationControls',
    component: NavigationControls,
    tags: ['autodocs'],
    argTypes: {
        onPrev: { action: 'prev' },
        onNext: { action: 'next' },
    },
} satisfies Meta<typeof NavigationControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstStep: Story = {
    args: {
        currentIndex: 0,
        totalSteps: 5,
        onPrev: () => { },
        onNext: () => { },
    },
};

export const MiddleStep: Story = {
    args: {
        currentIndex: 2,
        totalSteps: 5,
        onPrev: () => { },
        onNext: () => { },
    },
};

export const LastStep: Story = {
    args: {
        currentIndex: 4,
        totalSteps: 5,
        onPrev: () => { },
        onNext: () => { },
    },
};
