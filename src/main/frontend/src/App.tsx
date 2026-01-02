import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LessonView from './views/LessonView';

interface Lesson {
  id: string;
  title: string;
}

function Home() {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    fetch('/api/lessons')
      .then(res => res.json())
      .then(data => setLessons(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-10 font-sans">
      <header className="mb-12 border-b border-border pb-6">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Turtorial
        </h1>
        <p className="text-muted-foreground">Interactive Terminal Tutorials</p>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map(lesson => (
            <Link
              to={`/lesson/${lesson.id}`}
              key={lesson.id}
              className="block p-6 bg-card text-card-foreground rounded border border-border hover:border-foreground transition-colors"
            >
              <h2 className="text-xl font-bold mb-2 text-foreground">{lesson.title}</h2>
              <span className="text-sm text-muted-foreground font-medium">Start Module →</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lesson/:lessonId" element={<LessonView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
