import type { Meta, StoryObj } from '@storybook/react';
import BrowserPanel from './BrowserPanel';

const meta = {
  title: 'Lesson/BrowserPanel',
  component: BrowserPanel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BrowserPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
