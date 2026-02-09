import type { Meta, StoryObj } from '@storybook/react';
import TabbedPane from './TabbedPane';

const meta = {
  title: 'Lesson/TabbedPane',
  component: TabbedPane,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TabbedPane>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    decorators: [
        (Story) => (
            <div className="h-[400px] w-full bg-[#1e1e1e] p-4">
                <Story />
            </div>
        ),
    ],
};
