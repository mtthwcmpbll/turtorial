import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LessonView from './views/LessonView';
import LessonListView from './components/lesson-list/LessonListView';

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
        <LessonListView lessons={lessons} />
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
