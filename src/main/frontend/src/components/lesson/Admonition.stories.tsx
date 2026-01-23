import type { Meta, StoryObj } from '@storybook/react';
import Admonition from './Admonition';

const meta = {
    title: 'Lesson/Admonition',
    component: Admonition,
    tags: ['autodocs'],
    argTypes: {
        type: {
            control: 'select',
            options: ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'],
        },
    },
} satisfies Meta<typeof Admonition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Note: Story = {
    args: {
        type: 'NOTE',
        children: 'This is a note. It provides neutral information.',
    },
};

export const Tip: Story = {
    args: {
        type: 'TIP',
        children: 'This is a tip. It suggests a better way to do things.',
    },
};

export const Important: Story = {
    args: {
        type: 'IMPORTANT',
        children: 'This is important information you should not ignore.',
    },
};

export const Warning: Story = {
    args: {
        type: 'WARNING',
        children: 'This is a warning. Be careful.',
    },
};

export const Caution: Story = {
    args: {
        type: 'CAUTION',
        children: 'This is a caution. Something bad could happen.',
    },
};

export const CustomTitle: Story = {
    args: {
        type: 'TIP',
        title: 'Pro Tip!',
        children: 'You can customize the title of the admonition.',
    },
};
