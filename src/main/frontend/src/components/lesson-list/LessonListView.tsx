import LessonListItem from './LessonListItem';

interface LessonSummary {
    id: string;
    title: string;
}

interface LessonListViewProps {
    lessons: LessonSummary[];
}

export default function LessonListView({ lessons }: LessonListViewProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map(lesson => (
                <LessonListItem key={lesson.id} id={lesson.id} title={lesson.title} />
            ))}
        </div>
    );
}
