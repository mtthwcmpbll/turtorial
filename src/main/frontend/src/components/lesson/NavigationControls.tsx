import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NavigationControlsProps {
    currentIndex: number;
    totalSteps: number;
    onPrev: () => void;
    onNext: () => void;
}

export default function NavigationControls({ currentIndex, totalSteps, onPrev, onNext }: NavigationControlsProps) {
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === totalSteps - 1;

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={onPrev}
                disabled={isFirst}
                className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors border",
                    isFirst
                        ? "border-border text-muted-foreground cursor-not-allowed"
                        : "border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
            >
                Previous
            </button>
            <button
                onClick={onNext}
                disabled={isLast}
                className={cn(
                    "px-4 py-1.5 rounded-md text-sm font-bold transition-transform active:scale-95 border",
                    isLast
                        ? "bg-muted border-border text-muted-foreground cursor-not-allowed"
                        : "bg-primary border-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                )}
            >
                {isLast ? 'Finish' : 'Next Step'}
            </button>
        </div>
    );
}
