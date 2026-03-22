import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMsg(error.message);
    else navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="auth-page-clean">
      {/* Background ambient colors */}
      <div className="img-sphere-blue-huge-back"></div>
      <div className="img-sphere-orange-huge-back"></div>

      {/* Spheres precisely matching the image position */}
      <div className="img-sphere-orange-lg"></div>
      <div className="img-sphere-blue-lg"></div>
      <div className="img-sphere-orange-sm"></div>
      <div className="img-sphere-orange-md"></div>
      <div className="img-sphere-blue-md"></div>

      <div className="glass-circle-card">
        {/* Brand Logo added exactly at top */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', marginTop: '-0.75rem' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem' }}>M</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>MedicoHub</span>
        </div>

        <h1 className="glass-title">LOGIN</h1>

        <form className="glass-form" onSubmit={handleSubmit}>
          {errorMsg && (
            <div style={{ color: '#ef4444', fontSize: '0.75rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              {errorMsg}
            </div>
          )}

          <div className="glass-input-group">
            <label className="glass-label">Email</label>
            <input 
              type="email" 
              className="glass-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="glass-input-group">
            <label className="glass-label">Password</label>
            <input 
              type="password" 
              className="glass-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" disabled={loading} className="glass-button">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="glass-footer">
          <Link to="#" className="glass-link">Forgot password?</Link>
          <span style={{ color: '#64748b' }}>|</span>
          <Link to="/register" className="glass-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
