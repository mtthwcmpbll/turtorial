import type { Meta, StoryObj } from '@storybook/react';
import TerminalPanel from './TerminalPanel';

const meta = {
    title: 'Lesson/TerminalPanel',
    component: TerminalPanel,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            // Give it explicit height
            <div className="h-[500px] w-full border border-gray-800">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof TerminalPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
