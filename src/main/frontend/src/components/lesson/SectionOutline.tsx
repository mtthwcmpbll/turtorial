import * as ScrollArea from '@radix-ui/react-scroll-area';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Step } from '../../types';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SectionOutlineProps {
    steps: Step[];
    currentIndex: number;
    completedSteps: Set<number>;
    onSelectStep: (index: number) => void;
}

export default function SectionOutline({ steps, currentIndex, completedSteps, onSelectStep }: SectionOutlineProps) {
    return (
        <div className="w-64 flex-shrink-0 border-r border-border bg-muted/20 flex flex-col h-full">
            <ScrollArea.Root className="w-full h-full overflow-hidden">
                <ScrollArea.Viewport className="w-full h-full p-4 space-y-2 *:!block overscroll-contain">
                    {steps.map((step, index) => {
                        const isActive = index === currentIndex;
                        const isCompleted = completedSteps.has(index);
                        return (
                            <button
                                key={step.id || index}
                                onClick={() => onSelectStep(index)}
                                className={cn(
                                    "w-full text-left p-2.5 rounded-md flex items-center group transition-colors",
                                    isActive ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <div className={cn(
                                    "mr-3 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border transition-colors",
                                    isCompleted
                                        ? 'bg-success border-success text-success-foreground'
                                        : isActive
                                            ? 'border-primary text-primary'
                                            : 'border-border text-muted-foreground group-hover:border-foreground/50'
                                )}>
                                    {isCompleted ? (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    ) : (
                                        <span className="text-[10px] font-mono leading-none">{index + 1}</span>
                                    )}
                                </div>
                                <span className={cn("truncate text-sm", isActive ? 'text-foreground' : '')}>
                                    {step.title || `Step ${index + 1}`}
                                </span>
                            </button>
                        );
                    })}
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar orientation="vertical" className="flex select-none touch-none p-0.5 bg-muted transition-colors duration-[160ms] ease-out hover:bg-muted/80 w-2">
                    <ScrollArea.Thumb className="flex-1 bg-border rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                </ScrollArea.Scrollbar>
            </ScrollArea.Root>
        </div>
    );
}
