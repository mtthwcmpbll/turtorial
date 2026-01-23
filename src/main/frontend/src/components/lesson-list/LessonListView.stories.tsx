import type { Meta, StoryObj } from '@storybook/react';
import LessonListView from './LessonListView';
import { BrowserRouter } from 'react-router-dom';

const meta = {
    title: 'LessonList/LessonListView',
    component: LessonListView,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <BrowserRouter>
                <Story />
            </BrowserRouter>
        ),
    ],
} satisfies Meta<typeof LessonListView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        lessons: [
            { id: '1', title: 'Linux Basics' },
            { id: '2', title: 'Advanced Shell' },
            { id: '3', title: 'Vim Mastery' },
        ],
    },
};

export const Empty: Story = {
    args: {
        lessons: [],
    },
};
