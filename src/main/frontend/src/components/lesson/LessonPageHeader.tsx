interface LessonPageHeaderProps {
    title: string;
    onBack: () => void;
}

export default function LessonPageHeader({ title, onBack }: LessonPageHeaderProps) {
    return (
        <header className="h-14 flex items-center px-6 border-b border-border bg-background flex-shrink-0 z-10">
            <div className="flex items-center space-x-4">
                <button
                    onClick={onBack}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent"
                    aria-label="Back to home"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                </button>
                <span className="text-muted-foreground">/</span>
                <h1 className="text-lg font-bold text-foreground">{title}</h1>
            </div>
        </header>
    );
}
