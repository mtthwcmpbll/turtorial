import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';
import TerminalComponent from '../components/TerminalComponent';

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

    // Resize State
    const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Percentage
    const [isResizing, setIsResizing] = useState(false);

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

    // Resize Handlers
    const startResizing = (mouseDownEvent: React.MouseEvent) => {
        setIsResizing(true);
        mouseDownEvent.preventDefault();
    };

    const stopResizing = () => {
        setIsResizing(false);
    };

    const resize = (mouseMoveEvent: MouseEvent) => {
        if (isResizing) {
            const newWidth = (mouseMoveEvent.clientX / window.innerWidth) * 100;
            if (newWidth > 20 && newWidth < 80) { // Min/Max constraints
                setLeftPanelWidth(newWidth);
            }
        }
    };

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing]);

    if (loading) return <div className="p-10 text-black flex items-center justify-center h-screen bg-white">Loading lesson...</div>;
    if (!lesson) return <div className="p-10 text-black flex items-center justify-center h-screen bg-white">Lesson not found.</div>;

    const currentStep = lesson.steps[currentStepIndex];

    return (
        <div className="flex flex-col h-screen w-screen bg-white text-black overflow-hidden font-sans select-none">
            {/* 1. Global Header */}
            <header className="h-14 flex items-center px-6 border-b border-gray-200 bg-white flex-shrink-0 z-10">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-500 hover:text-black transition-colors p-1 rounded-md hover:bg-gray-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <span className="text-gray-300">/</span>
                    <h1 className="text-lg font-bold text-black">{lesson.title}</h1>
                </div>
            </header>

            {/* 2. Main Workspace */}
            <div className="flex flex-1 min-h-0 relative">
                {/* Left Block: Steps & Content */}
                <div
                    className="flex flex-col min-w-0"
                    style={{ width: `${leftPanelWidth}%` }}
                >

                    {/* Step Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Step {currentStepIndex + 1} of {lesson.steps.length}</span>
                                <h2 className="text-xl font-bold text-black">{currentStep.title}</h2>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={prevStep}
                                disabled={currentStepIndex === 0}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${currentStepIndex === 0
                                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                        : 'border-gray-300 text-gray-700 hover:text-black hover:bg-gray-100'
                                    }`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={nextStep}
                                disabled={currentStepIndex === lesson.steps.length - 1}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-transform active:scale-95 border ${currentStepIndex === lesson.steps.length - 1
                                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-black border-black text-white hover:bg-gray-800 shadow-sm'
                                    }`}
                            >
                                {currentStepIndex === lesson.steps.length - 1 ? 'Finish' : 'Next Step'}
                            </button>
                        </div>
                    </div>

                    {/* Inner Body */}
                    <div className="flex flex-1 min-h-0">
                        {/* Sidebar */}
                        <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
                            <div className="p-4 space-y-2">
                                {lesson.steps.map((step, index) => {
                                    const isActive = index === currentStepIndex;
                                    const isCompleted = completedSteps.has(index);
                                    return (
                                        <button
                                            key={step.id}
                                            onClick={() => jumpToStep(index)}
                                            className={`w-full text-left p-2.5 rounded-md flex items-center group transition-colors ${isActive
                                                    ? 'bg-gray-200 text-black font-medium'
                                                    : 'hover:bg-gray-100 text-gray-600 hover:text-black'
                                                }`}
                                        >
                                            <div className={`mr-3 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${isCompleted
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : isActive
                                                        ? 'border-black text-black'
                                                        : 'border-gray-300 text-gray-400 group-hover:border-gray-400'
                                                }`}>
                                                {isCompleted ? (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                ) : (
                                                    <span className="text-[10px] font-mono leading-none">{index + 1}</span>
                                                )}
                                            </div>
                                            <span className={`truncate text-sm ${isActive ? 'text-black' : ''}`}>
                                                {step.title || `Step ${index + 1}`}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 prose max-w-none bg-white">
                            <MarkdownRenderer content={currentStep.content} />

                            {currentStep.runCommand && (
                                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase">Try it out</h3>
                                    <div className="flex items-center space-x-4">
                                        <code className="flex-1 bg-gray-800 p-3 rounded font-mono text-sm text-green-400">
                                            {currentStep.runCommand}
                                        </code>
                                        <button
                                            onClick={() => runCommand(currentStep.runCommand!)}
                                            className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded font-medium transition-colors shadow-sm active:translate-y-0.5"
                                        >
                                            Run
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Resizer Handle */}
                <div
                    className={`w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize z-20 flex items-center justify-center transition-colors ${isResizing ? 'bg-blue-500' : ''}`}
                    onMouseDown={startResizing}
                >
                    <div className="h-4 w-0.5 bg-gray-400/50 rounded-full"></div>
                </div>

                {/* Right Block: Terminal */}
                <div
                    className="flex flex-col h-full bg-black border-l border-gray-200"
                    style={{ width: `${100 - leftPanelWidth}%` }}
                >
                    <div className="flex-1 relative">
                        <TerminalComponent />
                    </div>
                </div>

                {/* Overlay while resizing to prevent iframe (or terminal) stealing mouse events */}
                {isResizing && (
                    <div className="absolute inset-0 z-50 bg-transparent cursor-col-resize"></div>
                )}
            </div>
        </div>
    );
}
