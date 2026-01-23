import NavigationControls from './NavigationControls';

interface ContentHeaderProps {
    stepIndex: number;
    totalSteps: number;
    title: string;
    onPrev: () => void;
    onNext: () => void;
}

export default function ContentHeader({ stepIndex, totalSteps, title, onPrev, onNext }: ContentHeaderProps) {
    return (
        <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-muted/40 flex-shrink-0">
            <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        Step {stepIndex + 1} of {totalSteps}
                    </span>
                    <h2 className="text-xl font-bold text-foreground">{title}</h2>
                </div>
            </div>

            <NavigationControls
                currentIndex={stepIndex}
                totalSteps={totalSteps}
                onPrev={onPrev}
                onNext={onNext}
            />
        </div>
    );
}
