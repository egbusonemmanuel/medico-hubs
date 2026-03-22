import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface LeaderboardUser {
  id: string;
  email: string;
  streak_count: number;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    // Fetch top 10 simulated users from the users table sorted by streak count
    const { data, error } = await supabase
      .from('users')
      .select('id, email, streak_count')
      .order('streak_count', { ascending: false })
      .limit(10);
      
    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', background: 'linear-gradient(90deg, #FFD700, #FDB931)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Global Leaderboard</h1>
        <p className="text-muted" style={{ fontSize: '1.25rem' }}>Compete with medical students worldwide. Maintain your streak to climb the ranks!</p>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
        {loading ? (
           <div style={{ padding: '3rem', textAlign: 'center' }} className="text-muted">Loading leaderboard data...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {users.map((user, idx) => (
              <div 
                key={user.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1.5rem 2rem', 
                  borderBottom: idx === users.length - 1 ? 'none' : '1px solid var(--color-border)',
                  background: idx === 0 ? 'rgba(255, 215, 0, 0.05)' : idx === 1 ? 'rgba(192, 192, 192, 0.05)' : idx === 2 ? 'rgba(205, 127, 50, 0.05)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: idx < 3 ? '#000' : 'var(--color-text)',
                    boxShadow: idx < 3 ? '0 4px 10px rgba(0,0,0,0.2)' : 'none'
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user.email.split('@')[0]}</h3>
                    {idx === 0 && <span style={{ fontSize: '0.75rem', color: '#FFD700', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Champion</span>}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🔥</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-accent)' }}>{user.streak_count}</span>
                  <span className="text-muted text-sm">Days</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
