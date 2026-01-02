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

    if (loading) return <div className="p-10 text-white flex items-center justify-center h-screen bg-gray-900">Loading lesson...</div>;
    if (!lesson) return <div className="p-10 text-white flex items-center justify-center h-screen bg-gray-900">Lesson not found.</div>;

    const currentStep = lesson.steps[currentStepIndex];

    return (
        <div className="flex flex-col h-screen w-screen bg-gray-900 text-gray-100 overflow-hidden font-sans">
            {/* 1. Global Header */}
            <header className="h-14 flex items-center px-6 border-b border-gray-700 bg-gray-800 flex-shrink-0 z-10">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-700"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <span className="text-gray-500">/</span>
                    <h1 className="text-lg font-bold text-gray-100">{lesson.title}</h1>
                </div>
            </header>

            {/* 2. Main Workspace */}
            <div className="flex flex-1 min-h-0">
                {/* Left Block: Steps & Content */}
                <div className="flex flex-col flex-1 min-w-0 border-r border-gray-700">

                    {/* Step Header (Spans Sidebar & Content) */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-700 bg-gray-800/50 flex-shrink-0">
                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Step {currentStepIndex + 1} of {lesson.steps.length}</span>
                                <h2 className="text-xl font-bold text-white">{currentStep.title}</h2>
                            </div>
                        </div>

                        {/* Navigation Buttons moved to Header */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={prevStep}
                                disabled={currentStepIndex === 0}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${currentStepIndex === 0
                                    ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                                    : 'border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={nextStep}
                                disabled={currentStepIndex === lesson.steps.length - 1}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-transform active:scale-95 border ${currentStepIndex === lesson.steps.length - 1
                                    ? 'bg-gray-700 border-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-white border-white text-gray-900 hover:bg-gray-100 shadow-md'
                                    }`}
                            >
                                {currentStepIndex === lesson.steps.length - 1 ? 'Finish' : 'Next Step'}
                            </button>
                        </div>
                    </div>

                    {/* Inner Body: Sidebar + Content */}
                    <div className="flex flex-1 min-h-0">
                        {/* Sidebar */}
                        <div className="w-64 flex-shrink-0 border-r border-gray-700 bg-gray-800/30 overflow-y-auto">
                            <div className="p-4 space-y-2">
                                {lesson.steps.map((step, index) => {
                                    const isActive = index === currentStepIndex;
                                    const isCompleted = completedSteps.has(index);
                                    return (
                                        <button
                                            key={step.id}
                                            onClick={() => jumpToStep(index)}
                                            className={`w-full text-left p-2.5 rounded-md flex items-center group transition-colors ${isActive
                                                ? 'bg-blue-900/40 text-blue-100'
                                                : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200'
                                                }`}
                                        >
                                            <div className={`mr-3 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${isCompleted
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : isActive
                                                    ? 'border-blue-400 text-blue-400'
                                                    : 'border-gray-600 text-gray-600 group-hover:border-gray-500'
                                                }`}>
                                                {isCompleted ? (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                ) : (
                                                    <span className="text-[10px] font-mono leading-none">{index + 1}</span>
                                                )}
                                            </div>
                                            <span className={`truncate text-sm font-medium ${isActive ? 'text-white' : ''}`}>
                                                {step.title || `Step ${index + 1}`}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 prose prose-invert max-w-none bg-gray-900">
                            <MarkdownRenderer content={currentStep.content} />

                            {currentStep.runCommand && (
                                <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
                                    <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase">Try it out</h3>
                                    <div className="flex items-center space-x-4">
                                        <code className="flex-1 bg-black p-3 rounded font-mono text-sm text-green-400">
                                            {currentStep.runCommand}
                                        </code>
                                        <button
                                            onClick={() => runCommand(currentStep.runCommand!)}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors shadow-lg shadow-blue-900/20 active:translate-y-0.5"
                                        >
                                            Run
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Block: Terminal */}
                <div className="w-1/2 min-w-[400px] h-full bg-black flex flex-col border-l border-gray-700">
                    <div className="flex-1 relative">
                        <TerminalComponent />
                    </div>
                </div>
            </div>
        </div>
    );
}
