import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (lessonId) {
            fetch(`/api/lessons/${lessonId}`)
                .then(res => res.json())
                .then(data => {
                    setLesson(data);
                    setLoading(false);
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

    if (loading) return <div className="p-10 text-white">Loading lesson...</div>;
    if (!lesson) return <div className="p-10 text-white">Lesson not found.</div>;

    // For now, render all steps sequentially as a single document
    // Or we could have a stepper interface. 
    // The original app seemed to just have content.
    // We will render all steps.

    return (
        <div className="flex h-screen w-screen bg-gray-900 text-gray-100 overflow-hidden">
            {/* Left Panel: Content */}
            <div className="w-1/2 h-full overflow-y-auto border-r border-gray-700 bg-gray-900">
                <div className="p-8">
                    <h1 className="text-3xl font-bold mb-6 text-blue-400">{lesson.title}</h1>
                    {lesson.steps.map((step) => (
                        <div key={step.id} className="mb-12 border-b border-gray-800 pb-8 last:border-0">
                            <h2 className="text-2xl font-semibold mb-4 text-purple-300">{step.title}</h2>
                            <MarkdownRenderer content={step.content} />
                            {step.runCommand && (
                                <button
                                    onClick={() => runCommand(step.runCommand!)}
                                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-mono cursor-pointer transition-colors"
                                >
                                    Run: {step.runCommand}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel: Terminal */}
            <div className="w-1/2 h-full bg-black">
                <TerminalComponent />
            </div>
        </div>
    );
}
