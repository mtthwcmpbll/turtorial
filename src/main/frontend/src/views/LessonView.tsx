import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LessonLayout from '../components/lesson/LessonLayout';
import type { Lesson } from '../types';

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
    };

    const goBack = () => {
        navigate('/');
    };

    if (loading) return <div className="p-10 text-foreground flex items-center justify-center h-screen bg-background">Loading lesson...</div>;
    if (!lesson) return <div className="p-10 text-foreground flex items-center justify-center h-screen bg-background">Lesson not found.</div>;

    return (
        <LessonLayout
            lesson={lesson}
            currentStepIndex={currentStepIndex}
            completedSteps={completedSteps}
            onBack={goBack}
            onPrev={prevStep}
            onNext={nextStep}
            onSelectStep={jumpToStep}
            onRunCommand={runCommand}
        />
    );
}
