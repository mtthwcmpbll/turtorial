import { useState } from 'react';
import type { QuizQuestion } from '../../types';

interface QuizComponentProps {
    quiz: QuizQuestion;
    index: number;
}

export default function QuizComponent({ quiz, index }: QuizComponentProps) {
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [textInput, setTextInput] = useState<string>('');
    const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);

    const handleSubmit = () => {
        let isCorrect = false;

        if (quiz.type === 'CHOICE') {
            isCorrect = selectedOption === quiz.correctAnswer;
        } else if (quiz.type === 'TEXT') {
            if (quiz.validationRegex) {
                const regex = new RegExp(quiz.validationRegex);
                isCorrect = regex.test(textInput);
            }
        }

        setFeedback(isCorrect ? 'success' : 'error');
    };

    return (
        <div className="mt-8 p-6 bg-muted/40 rounded-lg border border-border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase">
                Question {index + 1}
            </h3>
            <p className="mb-4 text-foreground font-medium">{quiz.question}</p>

            {quiz.type === 'CHOICE' && quiz.options && (
                <div className="space-y-3">
                    {quiz.options.map((option) => (
                        <label key={option} className="flex items-center space-x-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center w-5 h-5">
                                <input
                                    type="radio"
                                    name={`quiz-${index}`}
                                    value={option}
                                    checked={selectedOption === option}
                                    onChange={(e) => {
                                        setSelectedOption(e.target.value);
                                        setFeedback(null);
                                    }}
                                    className="peer appearance-none w-5 h-5 rounded-full border border-muted-foreground/50 checked:border-primary checked:bg-primary transition-colors"
                                />
                                <div className="absolute w-2 h-2 rounded-full bg-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                            <span className="text-foreground/90 group-hover:text-foreground transition-colors">
                                {option}
                            </span>
                        </label>
                    ))}
                </div>
            )}

            {quiz.type === 'TEXT' && (
                <div className="space-y-3">
                    <input
                        type="text"
                        value={textInput}
                        onChange={(e) => {
                            setTextInput(e.target.value);
                            setFeedback(null);
                        }}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                        placeholder="Type your answer..."
                    />
                </div>
            )}

            <div className="mt-4 flex items-center space-x-4">
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded font-medium transition-colors shadow-sm active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedOption && !textInput}
                >
                    Check Answer
                </button>

                {feedback === 'success' && (
                    <span className="text-green-500 font-medium animate-in fade-in slide-in-from-left-2">
                        ✓ Correct!
                    </span>
                )}
                {feedback === 'error' && (
                    <span className="text-destructive font-medium animate-in fade-in slide-in-from-left-2">
                        ✗ Try again
                    </span>
                )}
            </div>
        </div>
    );
}
