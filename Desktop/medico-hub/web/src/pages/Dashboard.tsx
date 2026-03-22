import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchSummaries();
      fetchNotes();
      fetchProfile();

      // Realtime subscription setup
      const channel = supabase
        .channel('public:users')
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'users', 
            filter: `id=eq.${user.id}` 
          }, 
          (payload) => {
            console.log("Realtime Profile Update!", payload);
            setProfile(payload.new);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('users').select('*').eq('id', user?.id).single();
    if (data) setProfile(data);
  };

  const fetchSummaries = async () => {
    const { data, error } = await supabase
      .from('summaries')
      .select('*, notes(*)')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!error && data) {
      setSummaries(data);
    }
  };

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (!error && data) {
      setNotes(data);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('notes_bucket')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('notes_bucket')
        .getPublicUrl(filePath);

      const { error: noteError } = await supabase
        .from('notes')
        .insert({
           file_url: publicUrl,
           title: file.name,
           user_id: user.id
        });
        
      if (noteError) throw noteError;

      alert("Note uploaded successfully!");
      fetchNotes(); 
    } catch (err: any) {
      console.error('Upload Error:', err);
      alert(`Error uploading: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGenerateSummary = async (noteId: string) => {
    setIsGenerating(noteId);
    try {
      const { error: invokeError } = await supabase.functions.invoke('generate-summary', {
        body: { note_id: noteId }
      });

      if (invokeError) throw invokeError;

      alert("AI Summary generation triggered successfully! Check your Recent Summaries below.");
      fetchSummaries();
    } catch (err: any) {
      console.error('Generation Error:', err);
      alert(`Error calling generation: ${err.message}. If this persists, make sure the Edge Function is deployed!`);
    } finally {
      setIsGenerating(null);
    }
  };

  const streak = profile?.streak_count || 0;
  const xp = streak * 150 + (notes.length * 50);

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 24px' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Student Dashboard</h1>
          <p className="text-muted">Welcome back. Ready to study? 🔥</p>
        </div>
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange} 
            accept=".pdf,.docx,.txt"
          />
          <button 
            className="btn btn-primary" 
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading Note...' : '+ Upload Notes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '2px solid var(--color-primary)' }}>
          <h3 className="text-muted text-sm" style={{ marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total XP Earned (Live)</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', transition: 'all 0.3s' }}>{xp.toLocaleString()}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '2px solid var(--color-accent)' }}>
          <h3 className="text-muted text-sm" style={{ marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Study Streak</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-accent)', transition: 'all 0.3s' }}>{streak} Days</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '2px solid var(--color-secondary)' }}>
          <h3 className="text-muted text-sm" style={{ marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subscription status</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: profile?.subscription_tier === 'premium' ? 'var(--color-primary)' : 'var(--color-secondary)', textTransform: 'capitalize' }}>
            {profile?.subscription_tier || 'Free'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Uploaded Notes Section */}
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>My Uploaded Notes</h2>
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notes.length === 0 ? (
              <p className="text-muted">You haven't uploaded any notes yet. Upload one to get started!</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{note.title || `Note ${note.id.substring(0, 8)}`}</h4>
                    <span className="text-muted text-xs">
                      {new Date(note.created_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/notes/${note.id}`} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.875rem' }}>View</Link>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 14px', fontSize: '0.875rem', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                      onClick={() => handleGenerateSummary(note.id)}
                      disabled={isGenerating === note.id}
                    >
                      {isGenerating === note.id ? 'Generating...' : 'AI ✨'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Summaries Section */}
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Recent AI Summaries</h2>
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {summaries.length === 0 ? (
              <p className="text-muted">No summaries generated yet. Click 'AI ✨' on a note!</p>
            ) : (
              summaries.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.notes?.title || `AI Summary: ${item.notes?.id?.substring(0, 8)}`}</h4>
                    <span className="text-muted text-xs">
                      {new Date(item.created_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {!item.verified ? (
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>Unverified</span>
                    ) : (
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success)' }}>Verified ✅</span>
                    )}
                    <Link to="/flashcards" className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.875rem', textDecoration: 'none' }}>Study</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
