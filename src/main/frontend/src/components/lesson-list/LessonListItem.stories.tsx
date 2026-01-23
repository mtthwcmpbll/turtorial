import type { Meta, StoryObj } from '@storybook/react';
import LessonListItem from './LessonListItem';
import { BrowserRouter } from 'react-router-dom';

const meta = {
    title: 'LessonList/LessonListItem',
    component: LessonListItem,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <BrowserRouter>
                <Story />
            </BrowserRouter>
        ),
    ],
} satisfies Meta<typeof LessonListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        id: '1',
        title: 'Linux Introduction',
    },
};
