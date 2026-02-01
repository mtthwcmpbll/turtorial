import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import LessonPageHeader from './LessonPageHeader';
import ContentPanel from './ContentPanel';
import TerminalPanel from './TerminalPanel';
import type { Lesson } from '../../types';

interface LessonLayoutProps {
    lesson: Lesson;
    currentStepIndex: number;
    completedSteps: Set<number>;
    onBack: () => void;
    onPrev: () => void;
    onNext: () => void;
    onSelectStep: (index: number) => void;
}

export default function LessonLayout({
    lesson,
    currentStepIndex,
    completedSteps,
    onBack,
    onPrev,
    onNext,
    onSelectStep,

}: LessonLayoutProps) {
    return (
        <div className="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden font-sans">
            <LessonPageHeader title={lesson.title} onBack={onBack} />

            <div className="flex-1 min-h-0 relative">
                <PanelGroup orientation="horizontal" className="h-full w-full">
                    <Panel defaultSize="50" minSize="20" maxSize="80" className="flex flex-col min-w-0">
                        <ContentPanel
                            lesson={lesson}
                            stepIndex={currentStepIndex}
                            completedSteps={completedSteps}
                            onPrev={onPrev}
                            onNext={onNext}
                            onSelectStep={onSelectStep}
                        />
                    </Panel>

                    <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 cursor-col-resize flex items-center justify-center transition-colors data-[resize-handle-state=drag]:bg-primary">
                        <div className="h-4 w-0.5 bg-border rounded-full"></div>
                    </PanelResizeHandle>

                    <Panel className="flex flex-col min-w-[300px] border-l border-border bg-[#1e1e1e]">
                        <div className="flex-1 min-h-0">
                            <TerminalPanel />
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
}
