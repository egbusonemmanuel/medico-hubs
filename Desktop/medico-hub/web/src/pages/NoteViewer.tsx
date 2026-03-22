import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function NoteViewer() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [note, setNote] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNote(); }, [id]);

  const fetchNote = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*, users(email, full_name)')
      .eq('id', id)
      .single();
    if (!error && data) setNote(data);
    setLoading(false);
  };

  const handleGenerateSummary = async () => {
    if (!user) { alert('You must be logged in to generate AI summaries.'); return; }
    setIsGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-summary', { body: { note_id: note.id } });
      if (error) throw error;
      alert('AI Summary generation started! Check your Dashboard in a few moments.');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: note?.title || 'Medico Hub Note',
      text: `Check out this note on Medico Hub: "${note?.title}"`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch {
      // User cancelled share — that's fine!
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(255,215,0,0.2)', borderTop: '3px solid #FFD700', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading document…</p>
      </div>
    </div>
  );

  if (!note) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</p>
      <h2>Note not found</h2>
      <Link to="/discover" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>← Back to Feed</Link>
    </div>
  );

  const authorName = note.users?.full_name || note.users?.email?.split('@')[0] || 'Anonymous';

  return (
    <div className="animate-fade-in" style={{ padding: '1.5rem 1rem', maxWidth: '900px', margin: '0 auto', paddingBottom: '120px' }}>
      {/* Header */}
      <Link to="/discover" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        ← Back to Feed
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '0.375rem' }}>
            {note.title || `Note ${note.id.substring(0, 6)}`}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            By <strong style={{ color: 'var(--color-text)' }}>{authorName}</strong> · {new Date(note.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Document Content */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {note.file_url ? (
          <iframe
            src={note.file_url}
            style={{ width: '100%', border: 'none', minHeight: 'clamp(400px, 70vh, 800px)', background: 'white' }}
            title="Note Document"
          />
        ) : (
          <div style={{ padding: '2rem', whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '0.9375rem' }}>
            {note.raw_text || 'No content available for this note.'}
          </div>
        )}
      </div>

      {/* ── Floating Action Bar ─ fixed at bottom, pill shaped ── */}
      <div style={{
        position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '0.75rem', alignItems: 'center', zIndex: 50,
        background: 'rgba(15,15,15,0.85)', backdropFilter: 'blur(20px)',
        borderRadius: '9999px', padding: '0.625rem 1.25rem',
        border: '1px solid rgba(255,215,0,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        {/* Share button */}
        <button
          onClick={handleShare}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1.25rem', borderRadius: '9999px',
            background: shareSuccess ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)',
            border: `1px solid ${shareSuccess ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.15)'}`,
            color: shareSuccess ? '#10B981' : 'rgba(255,255,255,0.8)',
            fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {shareSuccess ? '✅ Copied!' : '🔗 Share'}
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.12)' }} />

        {/* AI Summarize button */}
        <button
          onClick={handleGenerateSummary}
          disabled={isGenerating}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1.5rem', borderRadius: '9999px',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: '#000', fontWeight: 600, fontSize: '0.875rem',
            border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.7 : 1,
            boxShadow: '0 4px 15px rgba(255,215,0,0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          {isGenerating ? (
            <>
              <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span>
              Analyzing…
            </>
          ) : '🧠 Summarize with AI'}
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
