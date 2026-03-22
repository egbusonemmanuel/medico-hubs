import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminPortal() {
  const { user, role } = useAuthStore();
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic protection (RLS should handle true security)
    if (role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [role, navigate]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch unverified summaries (acting as the verification proxy for notes)
    const { data: sData } = await supabase
      .from('summaries')
      .select('*, notes(*, users(email))')
      .eq('verified', false)
      .order('created_at', { ascending: false });
    
    if (sData) setSummaries(sData);

    // Fetch top recent users for admin management
    const { data: uData } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (uData) setUsers(uData);

    setLoading(false);
  };

  const handleVerify = async (id: string) => {
    const { error } = await supabase
      .from('summaries')
      .update({ verified: true, verified_by: user?.id })
      .eq('id', id);
      
    if (!error) {
      alert("Note Summary Verified successfully!");
      fetchData();
    } else {
      alert("Error verifying: " + error.message);
    }
  };

  const handleMakeTutor = async (id: string) => {
     const { error } = await supabase.from('users').update({ role: 'tutor' }).eq('id', id);
     if (!error) {
         fetchData();
     } else {
         alert("Error updating role: " + error.message);
     }
  };

  if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading Admin Control Center...</div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '100px', color: 'var(--color-danger)', fontWeight: 600, marginBottom: '1rem', fontSize: '0.875rem' }}>
            Restricted Admin Privilege Active
        </div>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Admin Control Center</h1>
        <p className="text-muted" style={{ fontSize: '1.25rem' }}>Manage users, assign tutor roles, and verify uploaded notes & summaries.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Verification Queue */}
        <div className="glass-panel" style={{ padding: '2.5rem 2rem', borderTop: '4px solid var(--color-primary)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ background: 'rgba(255,215,0,0.2)', padding: '4px 12px', borderRadius: '100px', fontSize: '1rem', color: 'var(--color-primary)' }}>{summaries.length}</span>
            Content Verifications
          </h2>
          {summaries.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>All notes and summaries are verified! Nothing in the queue. 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {summaries.map((s) => (
                <div key={s.id} style={{ padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'rgba(0,0,0,0.3)' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>{s.notes?.title || 'Untitled Note'}</h4>
                  <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>Uploaded by: <span style={{ color: 'var(--color-primary)' }}>{s.notes?.users?.email || 'Unknown'}</span></p>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link to={`/notes/${s.note_id}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.875rem', flex: 1 }}>Review File</Link>
                    <button onClick={() => handleVerify(s.id)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem', flex: 1 }}>Global Verify ✔️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Management */}
        <div className="glass-panel" style={{ padding: '2.5rem 2rem', borderTop: '4px solid var(--color-secondary)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Recent Users Management</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {users.map(u => (
                 <div key={u.id} style={{ padding: '1rem 1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 0, 0, 0.2)' }}>
                     <div>
                         <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{u.email}</div>
                         <div className="text-muted text-sm">Role: <span style={{ color: u.role === 'admin' ? 'var(--color-danger)' : u.role === 'tutor' ? 'var(--color-secondary)' : 'var(--color-text)' }}>{u.role.toUpperCase()}</span> | XP Base: {u.streak_count * 150}</div>
                     </div>
                     {u.role === 'student' && (
                         <button onClick={() => handleMakeTutor(u.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'var(--color-secondary)', color: 'var(--color-secondary)' }}>Promote to Tutor</button>
                     )}
                 </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}
