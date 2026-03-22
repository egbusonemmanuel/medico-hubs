import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TutorPortal from './pages/TutorPortal';
import Flashcards from './pages/Flashcards';
import Leaderboard from './pages/Leaderboard';
import Premium from './pages/Premium';
import PublicFeed from './pages/PublicFeed';
import NoteViewer from './pages/NoteViewer';
import AdminPortal from './pages/AdminPortal';
import { useAuthStore } from './store/authStore';
import LoadingScreen from './components/LoadingScreen';

function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '90vh' }}>
      <section className="container flex-center" style={{ flex: 1, flexDirection: 'column', gap: '2rem', padding: '6rem 1rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* Background glow effects */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'var(--color-primary)', filter: 'blur(150px)', opacity: 0.1, zIndex: -1 }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', background: 'var(--color-secondary)', filter: 'blur(150px)', opacity: 0.1, zIndex: -1 }}></div>

        <div style={{ textAlign: 'center', zIndex: 1, maxWidth: '800px' }} className="animate-fade-in">
          <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)', borderRadius: '100px', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '2rem', fontSize: '0.875rem' }}>
            🚀 Medico Hub V2: Hack Your Degree
          </div>
          
          <h1 className="text-gradient" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', marginBottom: '1.5rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Master Medicine <br />
            <span style={{ color: 'var(--color-text)', WebkitTextFillColor: 'var(--color-text)' }}>With AI & Peer Notes</span>
          </h1>
          
          <p className="text-muted" style={{ fontSize: 'clamp(1rem, 3vw, 1.35rem)', maxWidth: '650px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
            The exclusive social learning platform for medical students. Upload notes, automatically generate 3D flashcards, and compete on the global leaderboard.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', minWidth: '200px' }}>Join the Elite</Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', minWidth: '200px', border: '1px solid rgba(100,100,100,0.2)', background: 'rgba(100,100,100,0.05)' }}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* Feature showcase */}
      <section className="container" style={{ padding: '4rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', zIndex: 1 }}>
        <div className="glass-panel" style={{ padding: '2.5rem 2rem', borderTop: '4px solid var(--color-primary)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧠</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>AI-Powered Summaries</h3>
          <p className="text-muted">Instantly transform any lecture PDF into structured, high-yield summaries and core clinical concepts.</p>
        </div>
        <div className="glass-panel" style={{ padding: '2.5rem 2rem', borderTop: '4px solid var(--color-secondary)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🃏</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Spaced Repetition</h3>
          <p className="text-muted">Master topics deeply with interactive 3D flashcards scheduled automatically by advanced SM2 algorithms.</p>
        </div>
        <div className="glass-panel" style={{ padding: '2.5rem 2rem', borderTop: '4px solid var(--color-success)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌍</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Global Public Feed</h3>
          <p className="text-muted">Share your brilliant notes with the community and seamlessly discover verified top-tier resources from tutors.</p>
        </div>
      </section>
    </div>
  );
}

function Navbar() {
  const { session, role, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
      await signOut();
      navigate('/login');
  };

  return (
    <nav className="glass-panel" style={{ margin: '1rem 24px', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '100px' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-primary)' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>M</div>
        MedicoHub
      </Link>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={toggleTheme} 
          style={{ 
            width: '56px', 
            height: '28px', 
            borderRadius: '100px', 
            background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', 
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.2)',
            position: 'relative',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '2px',
            transition: 'background 0.3s ease, border 0.3s ease'
          }}
        >
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            boxShadow: theme === 'dark' ? '0 0 10px rgba(255,215,0,0.4)' : '0 2px 5px rgba(0,0,0,0.2)',
            transform: theme === 'dark' ? 'translateX(0)' : 'translateX(28px)',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '12px'
          }}>
             {theme === 'dark' ? '🌙' : '☀️'}
          </div>
        </button>
        {session ? (
            <>
                <Link to="/discover" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.875rem', border: '1px solid var(--color-border)' }}>Discover</Link>
                <Link to="/dashboard" className="btn" style={{ padding: '8px 16px', fontSize: '0.875rem', background: 'transparent', color: 'var(--color-text)' }}>Dashboard</Link>
                <Link to="/flashcards" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.875rem', border: '1px solid var(--color-border)' }}>Study Cards</Link>
                <Link to="/leaderboard" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.875rem', border: '1px solid var(--color-accent)' }}>Leaderboard</Link>
                <Link to="/premium" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem', border: 'none' }}>Go Premium</Link>
                {role === 'tutor' && (
                    <Link to="/tutor-portal" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.875rem', border: '1px solid var(--color-secondary)', color: 'var(--color-secondary)' }}>Tutor Portal</Link>
                )}
                {role === 'admin' && (
                    <Link to="/admin" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', color: 'var(--color-danger)' }}>Admin</Link>
                )}
                <button onClick={handleSignOut} className="btn" style={{ padding: '8px 16px', fontSize: '0.875rem', background: 'transparent', color: 'var(--color-danger)' }}>Sign Out</button>
            </>
        ) : (
            <>
                <Link to="/discover" className="btn btn-secondary" style={{ margin: '0 8px', padding: '8px 16px', fontSize: '0.875rem', border: '1px solid var(--color-border)' }}>Discover Notes</Link>
                <Link to="/login" className="btn" style={{ padding: '8px 16px', fontSize: '0.875rem', background: 'transparent', color: 'var(--color-primary)' }}>Login</Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>Sign Up</Link>
            </>
        )}
      </div>
    </nav>
  );
}

function App() {
  const { initialize, isLoading } = useAuthStore();
  
  // Initialize Supabase Auth Session on mount
  useEffect(() => {
     initialize();
  }, [initialize]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tutor-portal" element={<TutorPortal />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/discover" element={<PublicFeed />} />
          <Route path="/notes/:id" element={<NoteViewer />} />
          <Route path="/admin" element={<AdminPortal />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
