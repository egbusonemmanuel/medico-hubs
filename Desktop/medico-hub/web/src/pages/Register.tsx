import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}`, role: 'student' } }
    });
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

      {/* A slightly larger circle to fit First/Last Name fields */}
      <div className="glass-circle-register">
        {/* Brand Logo added exactly at top */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', marginTop: '-0.75rem' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem' }}>M</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>MedicoHub</span>
        </div>

        <h1 className="glass-title" style={{ marginBottom: '1rem' }}>SIGN UP</h1>

        <form className="glass-form" onSubmit={handleSubmit} style={{ gap: '0.875rem' }}>
          {errorMsg && (
            <div style={{ color: '#ef4444', fontSize: '0.75rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div className="glass-input-group">
              <label className="glass-label">First Name</label>
              <input type="text" className="glass-input" style={{ height: '36px' }} value={firstName} onChange={e => setFirstName(e.target.value)} required />
            </div>
            <div className="glass-input-group">
              <label className="glass-label">Last Name</label>
              <input type="text" className="glass-input" style={{ height: '36px' }} value={lastName} onChange={e => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="glass-input-group">
            <label className="glass-label">Email</label>
            <input type="email" className="glass-input" style={{ height: '36px' }} value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="glass-input-group">
            <label className="glass-label">Password</label>
            <input type="password" className="glass-input" style={{ height: '36px' }} value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" disabled={loading} className="glass-button">
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <div className="glass-footer" style={{ marginTop: '1rem' }}>
          <span style={{ color: '#64748b' }}>Have an account?</span>
          <Link to="/login" className="glass-link">Log in</Link>
        </div>
      </div>
    </div>
  );
}
