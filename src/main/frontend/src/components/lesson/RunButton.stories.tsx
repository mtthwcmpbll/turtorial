import type { Meta, StoryObj } from '@storybook/react';
import RunButton from './RunButton';

const meta = {
    title: 'Lesson/RunButton',
    component: RunButton,
    tags: ['autodocs'],
    argTypes: {
        onClick: { action: 'clicked' },
    },
} satisfies Meta<typeof RunButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        command: 'echo "Hello World"',
    },
};
