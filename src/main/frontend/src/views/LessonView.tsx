import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';
import TerminalComponent from '../components/TerminalComponent';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for Tailwind class merging
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Step {
    id: string;
    title: string;
    content: string;
    runCommand?: string;
    testCommand?: string;
}

interface Lesson {
    id: string;
    title: string;
    steps: Step[];
}

export default function LessonView() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (lessonId) {
            setLoading(true);
            fetch(`/api/lessons/${lessonId}`)
                .then(res => res.json())
                .then(data => {
                    setLesson(data);
                    setLoading(false);
                    setCurrentStepIndex(0);
                    setCompletedSteps(new Set());
                })
                .catch(err => {
                    console.error("Failed to fetch lesson", err);
                    setLoading(false);
                });
        }
    }, [lessonId]);

    const runCommand = (cmd: string) => {
        window.dispatchEvent(new CustomEvent('terminal:input', { detail: cmd + '\r' }));
    };

    const nextStep = () => {
        if (lesson && currentStepIndex < lesson.steps.length - 1) {
            // Mark current as complete when moving forward
            const newCompleted = new Set(completedSteps);
            newCompleted.add(currentStepIndex);
            setCompletedSteps(newCompleted);
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const jumpToStep = (index: number) => {
        setCurrentStepIndex(index);
    }

    if (loading) return <div className="p-10 text-foreground flex items-center justify-center h-screen bg-background">Loading lesson...</div>;
    if (!lesson) return <div className="p-10 text-foreground flex items-center justify-center h-screen bg-background">Lesson not found.</div>;

    const currentStep = lesson.steps[currentStepIndex];

    return (
        <div className="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden font-sans">
            {/* 1. Global Header */}
            <header className="h-14 flex items-center px-6 border-b border-border bg-background flex-shrink-0 z-10">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/')}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <span className="text-muted-foreground">/</span>
                    <h1 className="text-lg font-bold text-foreground">{lesson.title}</h1>
                </div>
            </header>

            {/* 2. Main Workspace */}
            <div className="flex-1 min-h-0 relative">
                <PanelGroup orientation="horizontal" className="h-full w-full">
                    {/* Left Panel: Steps & Content */}
                    <Panel defaultSize="50" minSize="20" maxSize="80" className="flex flex-col min-w-0">

                        {/* Step Header */}
                        <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-muted/40 flex-shrink-0">
                            <div className="flex items-center space-x-4">
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Step {currentStepIndex + 1} of {lesson.steps.length}</span>
                                    <h2 className="text-xl font-bold text-foreground">{currentStep.title}</h2>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={prevStep}
                                    disabled={currentStepIndex === 0}
                                    className={cn(
                                        "px-3 py-1.5 rounded-md text-sm font-medium transition-colors border",
                                        currentStepIndex === 0
                                            ? "border-border text-muted-foreground cursor-not-allowed"
                                            : "border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={nextStep}
                                    disabled={currentStepIndex === lesson.steps.length - 1}
                                    className={cn(
                                        "px-4 py-1.5 rounded-md text-sm font-bold transition-transform active:scale-95 border",
                                        currentStepIndex === lesson.steps.length - 1
                                            ? "bg-muted border-border text-muted-foreground cursor-not-allowed"
                                            : "bg-primary border-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                    )}
                                >
                                    {currentStepIndex === lesson.steps.length - 1 ? 'Finish' : 'Next Step'}
                                </button>
                            </div>
                        </div>

                        {/* Inner Body: Sidebar + Content */}
                        <div className="flex flex-1 min-h-0">
                            {/* Sidebar */}
                            <div className="w-64 flex-shrink-0 border-r border-border bg-muted/20 flex flex-col">
                                <ScrollArea.Root className="w-full h-full overflow-hidden">
                                    <ScrollArea.Viewport className="w-full h-full p-4 space-y-2 *:!block overscroll-contain">
                                        {lesson.steps.map((step, index) => {
                                            const isActive = index === currentStepIndex;
                                            const isCompleted = completedSteps.has(index);
                                            return (
                                                <button
                                                    key={step.id}
                                                    onClick={() => jumpToStep(index)}
                                                    className={cn(
                                                        "w-full text-left p-2.5 rounded-md flex items-center group transition-colors",
                                                        isActive ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "mr-3 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border transition-colors",
                                                        isCompleted
                                                            ? 'bg-success border-success text-success-foreground'
                                                            : isActive
                                                                ? 'border-primary text-primary'
                                                                : 'border-border text-muted-foreground group-hover:border-foreground/50'
                                                    )}>
                                                        {isCompleted ? (
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                        ) : (
                                                            <span className="text-[10px] font-mono leading-none">{index + 1}</span>
                                                        )}
                                                    </div>
                                                    <span className={cn("truncate text-sm", isActive ? 'text-foreground' : '')}>
                                                        {step.title || `Step ${index + 1}`}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </ScrollArea.Viewport>
                                    <ScrollArea.Scrollbar orientation="vertical" className="flex select-none touch-none p-0.5 bg-muted transition-colors duration-[160ms] ease-out hover:bg-muted/80 w-2">
                                        <ScrollArea.Thumb className="flex-1 bg-border rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                                    </ScrollArea.Scrollbar>
                                </ScrollArea.Root>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col min-w-0 bg-background">
                                <ScrollArea.Root className="w-full h-full overflow-hidden">
                                    <ScrollArea.Viewport className="w-full h-full p-8 *:!block overscroll-contain">
                                        <div className="prose max-w-none w-full min-w-0 break-words text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border prose-pre:overflow-x-auto">
                                            <MarkdownRenderer content={currentStep.content} />

                                            {currentStep.runCommand && (
                                                <div className="mt-8 p-4 bg-muted/40 rounded-lg border border-border">
                                                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase">Try it out</h3>
                                                    <div className="flex items-center space-x-4">
                                                        <code className="flex-1 bg-primary p-3 rounded font-mono text-sm text-primary-foreground border border-border/20">
                                                            {currentStep.runCommand}
                                                        </code>
                                                        <button
                                                            onClick={() => runCommand(currentStep.runCommand!)}
                                                            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded font-medium transition-colors shadow-sm active:translate-y-0.5"
                                                        >
                                                            Run
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea.Viewport>
                                    <ScrollArea.Scrollbar orientation="vertical" className="flex select-none touch-none p-0.5 bg-muted transition-colors duration-[160ms] ease-out hover:bg-muted/80 w-2.5">
                                        <ScrollArea.Thumb className="flex-1 bg-border rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                                    </ScrollArea.Scrollbar>
                                </ScrollArea.Root>
                            </div>
                        </div>
                    </Panel>

                    {/* Resizer */}
                    <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 cursor-col-resize flex items-center justify-center transition-colors data-[resize-handle-state=drag]:bg-primary">
                        <div className="h-4 w-0.5 bg-border rounded-full"></div>
                    </PanelResizeHandle>

                    {/* Right Panel: Terminal */}
                    <Panel className="flex flex-col min-w-[300px] border-l border-border bg-[#1e1e1e]">
                        <div className="flex-1 min-h-0">
                            <TerminalComponent />
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
}
