export interface Step {
    id: string;
    title: string;
    content: string;
    runCommand?: string;
    testCommand?: string;
}

export interface Lesson {
    id: string;
    title: string;
    steps: Step[];
}
