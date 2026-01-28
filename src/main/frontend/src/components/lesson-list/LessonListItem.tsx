import { Link } from 'react-router-dom';

interface LessonListItemProps {
    id: string;
    title: string;
    description?: string;
}

export default function LessonListItem({ id, title, description }: LessonListItemProps) {
    return (
        <Link
            to={`/lesson/${id}`}
            className="block p-6 bg-card text-card-foreground rounded border border-border hover:border-foreground transition-colors group"
        >
            <h2 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">{title}</h2>
            {description && <p className="text-muted-foreground mb-4">{description}</p>}
            <span className="text-sm text-muted-foreground font-medium group-hover:text-foreground">Start Module →</span>
        </Link>
    );
}
