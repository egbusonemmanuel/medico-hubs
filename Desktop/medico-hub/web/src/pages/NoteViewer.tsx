import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function NoteViewer() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [note, setNote] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*, users(email)')
      .eq('id', id)
      .single();
      
    if (!error && data) {
      setNote(data);
    }
    setLoading(false);
  };

  const handleGenerateSummary = async () => {
    if (!note || !user) {
      alert("You must be logged in to generate AI summaries for global notes.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const { error: invokeError } = await supabase.functions.invoke('generate-summary', {
        body: { note_id: note.id } // Edge function will generate summary attached to this note.
      });

      if (invokeError) throw invokeError;

      alert("AI Summary generation triggered! Check your Dashboard.");
    } catch (err: any) {
      console.error('Generation Error:', err);
      alert(`Error calling generation: ${err.message}.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: note?.title || 'Medico Hub Note',
        text: 'A highly rated note on Medico Hub.',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading document...</div>;
  if (!note) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Note not found.</div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', minHeight: '85vh' }}>
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/discover" className="text-muted text-sm" style={{ textDecoration: 'none', marginBottom: '0.5rem', display: 'inline-block' }}>← Back to Feed</Link>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{note.title || `Note Document ${note.id.substring(0, 6)}`}</h1>
          <p className="text-muted text-sm">Uploaded by {note.users?.email?.split('@')[0] || 'Unknown'} on {new Date(note.created_at).toLocaleDateString()}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleShare} className="btn btn-secondary">
            Share 🔗
          </button>
          <button 
            onClick={handleGenerateSummary} 
            className="btn btn-primary"
            disabled={isGenerating}
            style={{ boxShadow: '0 4px 15px rgba(255,215,0,0.4)', border: '1px solid var(--color-primary)' }}
          >
            {isGenerating ? 'Analyzing...' : 'Summarize with AI 🧠'}
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ flex: 1, padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Simple iframe for PDF or Text viewing. Supabase storage returns an actual PDF/txt file url. */}
        {note.file_url ? (
          <iframe 
            src={note.file_url} 
            style={{ width: '100%', flex: 1, border: 'none', minHeight: '600px', background: 'white' }} 
            title="Note Document"
          />
        ) : (
          <div style={{ padding: '3rem', whiteSpace: 'pre-wrap', color: 'var(--color-text)' }}>
            {note.raw_text || "No content found for this note."}
          </div>
        )}
      </div>
    </div>
  );
}
