import * as ScrollArea from '@radix-ui/react-scroll-area';
import MarkdownRenderer from '../MarkdownRenderer';
import QuizComponent from './QuizComponent';
import type { QuizQuestion } from '../../types';

interface ContentSectionProps {
    content: string;
    quizzes?: QuizQuestion[];
}

export default function ContentSection({ content, quizzes }: ContentSectionProps) {
    return (
        <div className="flex-1 flex flex-col min-w-0 bg-background h-full">
            <ScrollArea.Root className="w-full h-full overflow-hidden">
                <ScrollArea.Viewport className="w-full h-full p-8 *:!block overscroll-contain">
                    <div className="prose max-w-none w-full min-w-0 break-words text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary prose-code:before:content-none prose-code:after:content-none prose-code:bg-muted/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-code:font-mono prose-code:font-normal prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border prose-pre:overflow-x-auto">
                        <MarkdownRenderer content={content} />

                        {quizzes && quizzes.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-xl font-bold mb-4">Quiz</h2>
                                {quizzes.map((quiz, index) => (
                                    <QuizComponent key={index} quiz={quiz} index={index} />
                                ))}
                            </div>
                        )}


                    </div>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar orientation="vertical" className="flex select-none touch-none p-0.5 bg-muted transition-colors duration-[160ms] ease-out hover:bg-muted/80 w-2.5">
                    <ScrollArea.Thumb className="flex-1 bg-border rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                </ScrollArea.Scrollbar>
            </ScrollArea.Root>
        </div>
    );
}
