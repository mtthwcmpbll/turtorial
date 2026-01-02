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
    <div className="min-h-screen bg-gray-900 text-white p-10 font-sans">
      <header className="mb-12">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
          Turtorial
        </h1>
        <p className="text-xl text-gray-400">Interactive Terminal Tutorials</p>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map(lesson => (
            <Link
              to={`/lesson/${lesson.id}`}
              key={lesson.id}
              className="block p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1"
            >
              <h2 className="text-2xl font-bold mb-2 text-blue-300">{lesson.title}</h2>
              <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Start Module →</span>
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
