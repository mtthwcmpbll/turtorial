import type { Meta, StoryObj } from '@storybook/react';
import SectionOutline from './SectionOutline';
import type { Step } from '../../types';

const meta = {
    title: 'Lesson/SectionOutline',
    component: SectionOutline,
    tags: ['autodocs'],
    argTypes: {
        onSelectStep: { action: 'selected' },
    },
    decorators: [
        (Story) => (
            <div className="h-[400px] border border-border">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof SectionOutline>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockSteps: Step[] = [
    { id: '1', title: 'Introduction', content: '' },
    { id: '2', title: 'Listing Files', content: '' },
    { id: '3', title: 'Changing Directories', content: '' },
    { id: '4', title: 'Making Directories', content: '' },
    { id: '5', title: 'Moving Files', content: '' },
];

export const Default: Story = {
    args: {
        steps: mockSteps,
        currentIndex: 1,
        completedSteps: new Set([0]),
        onSelectStep: () => { },
    },
};

export const AllCompleted: Story = {
    args: {
        steps: mockSteps,
        currentIndex: 4,
        completedSteps: new Set([0, 1, 2, 3]),
        onSelectStep: () => { },
    },
};
