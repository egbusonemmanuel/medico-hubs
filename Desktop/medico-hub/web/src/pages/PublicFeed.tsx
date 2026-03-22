import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export default function PublicFeed() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalNotes();
  }, []);

  const fetchGlobalNotes = async () => {
    setLoading(true);
    // Join with profiles to get user info if available, otherwise just fetch notes
    const { data, error } = await supabase
      .from('notes')
      .select('*, users(email)')
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (!error && data) {
      setNotes(data);
    }
    setLoading(false);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Global <span className="text-gradient">Discover</span></h1>
        <p className="text-muted" style={{ fontSize: '1.25rem' }}>Explore the best medical notes and summaries from students worldwide.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {loading ? (
           <p className="text-muted text-center" style={{ textAlign: 'center', padding: '3rem' }}>Loading global feed...</p>
        ) : notes.length === 0 ? (
           <p className="text-muted text-center" style={{ textAlign: 'center', padding: '3rem' }}>No notes are publicly available right now. Be the first to upload!</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="flex-between">
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{note.title || `Note Document ${note.id.substring(0,6)}`}</h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className="text-muted text-sm">By User: {note.users?.email?.split('@')[0] || 'Unknown Scholar'}</span>
                    <span className="text-muted text-sm">•</span>
                    <span className="text-muted text-sm">{new Date(note.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Link to={`/notes/${note.id}`} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
                  Open Document
                </Link>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '10px 20px', fontSize: '0.875rem' }}
                  onClick={async () => {
                    if (navigator.share) {
                      await navigator.share({
                        title: note.title,
                        text: 'Check out this Medico Hub note!',
                        url: `${window.location.origin}/notes/${note.id}`,
                      });
                    } else {
                      navigator.clipboard.writeText(`${window.location.origin}/notes/${note.id}`);
                      alert("Link copied to clipboard!");
                    }
                  }}
                >
                  Share 🔗
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
