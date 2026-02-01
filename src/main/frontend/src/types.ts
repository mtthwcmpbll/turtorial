export interface QuizQuestion {
    question: string;
    type: 'CHOICE' | 'TEXT';
    options?: string[];
    correctAnswer?: string;
    validationRegex?: string;
}

export interface Step {
    id: string;
    title: string;
    content: string;

    testCommand?: string;
    section?: string;
    quizzes?: QuizQuestion[];
}

export interface Lesson {
    id: string;
    title: string;
    steps: Step[];
}
