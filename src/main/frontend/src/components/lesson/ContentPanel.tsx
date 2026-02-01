import ContentHeader from './ContentHeader';
import SectionOutline from './SectionOutline';
import ContentSection from './ContentSection';
import type { Lesson } from '../../types';

interface ContentPanelProps {
    lesson: Lesson;
    stepIndex: number;
    completedSteps: Set<number>;
    onPrev: () => void;
    onNext: () => void;
    onSelectStep: (index: number) => void;
    onRunCommand: (cmd: string) => void;
}

export default function ContentPanel({
    lesson,
    stepIndex,
    completedSteps,
    onPrev,
    onNext,
    onSelectStep,
    onRunCommand
}: ContentPanelProps) {
    const currentStep = lesson.steps[stepIndex];

    return (
        <div className="flex flex-col min-w-0 h-full w-full">
            <ContentHeader
                stepIndex={stepIndex}
                totalSteps={lesson.steps.length}
                title={currentStep.title}
                onPrev={onPrev}
                onNext={onNext}
            />

            <div className="flex flex-1 min-h-0">
                <SectionOutline
                    steps={lesson.steps}
                    currentIndex={stepIndex}
                    completedSteps={completedSteps}
                    onSelectStep={onSelectStep}
                />
                <ContentSection
                    content={currentStep.content}
                    runCommand={currentStep.runCommand}
                    onRunCommand={onRunCommand}
                    quizzes={currentStep.quizzes}
                />
            </div>
        </div>
    );
}
