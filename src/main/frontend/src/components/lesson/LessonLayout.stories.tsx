import type { Meta, StoryObj } from '@storybook/react';
import LessonLayout from './LessonLayout';
import type { Lesson } from '../../types';

const meta = {
    title: 'Lesson/LessonLayout',
    component: LessonLayout,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        onBack: { action: 'back' },
        onPrev: { action: 'prev' },
        onNext: { action: 'next' },
        onSelectStep: { action: 'select step' },
    },
} satisfies Meta<typeof LessonLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockLesson: Lesson = {
    id: '1',
    title: 'Comprehensive Shell Course',
    steps: [
        {
            id: '1-1', title: 'Introduction', content: '# Welcome\n\nStart here.'
        },
        {
            id: '1-2', title: 'Files', content: '# Files\n\nLearn about files.'
        },
    ],
};

export const Default: Story = {
    args: {
        lesson: mockLesson,
        currentStepIndex: 0,
        completedSteps: new Set(),
        onBack: () => { },
        onPrev: () => { },
        onNext: () => { },
        onSelectStep: () => { },
    },
};
