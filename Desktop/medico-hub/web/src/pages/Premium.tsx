import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Premium() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSimulatedPayment = async () => {
    if (!user) return;
    setLoading(true);

    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update user subscription_tier in the database
    const { error } = await supabase
      .from('users')
      .update({ subscription_tier: 'premium' })
      .eq('id', user.id);

    if (error) {
      console.error("Payment update error:", error);
      alert("Payment failed. Please try again.");
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    }
    
    setLoading(false);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 24px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Unlock Medico Hub Premium
      </h1>
      <p className="text-muted" style={{ fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
        Supercharge your medical studies with advanced AI generation, unlimited uploads, and priority Tutor verification.
      </p>

      {success ? (
        <div className="glass-panel animate-fade-in" style={{ padding: '4rem', border: '2px solid var(--color-success)' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--color-success)', marginBottom: '1rem' }}>Payment Successful! 🎉</h2>
          <p className="text-muted" style={{ fontSize: '1.25rem' }}>You are now a Premium user. Redirecting to your dashboard...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            
          {/* Free Tier */}
          <div className="glass-panel" style={{ flex: '1', minWidth: '300px', padding: '3rem 2rem', border: '1px solid var(--color-border)', opacity: 0.7 }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Basic Plan</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>$0 <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>/ month</span></p>
            <ul style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
              <li>✅ 3 AI Summaries / month</li>
              <li>✅ Basic Flashcards</li>
              <li>✅ Global Leaderboard Access</li>
              <li className="text-muted">❌ Priority Tutor Review</li>
              <li className="text-muted">❌ AI Clinical Cases</li>
            </ul>
            <button className="btn btn-secondary" style={{ width: '100%' }} disabled>Current Plan</button>
          </div>

          {/* Premium Tier */}
          <div className="glass-panel" style={{ flex: '1', minWidth: '300px', padding: '3rem 2rem', border: '2px solid var(--color-primary)', position: 'relative', transform: 'scale(1.05)', boxShadow: '0 20px 40px rgba(2, 132, 199, 0.2)' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary)', color: 'white', padding: '4px 16px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 600 }}>RECOMMENDED</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Pro Scholar</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>$12<span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>.99 / month</span></p>
            <ul style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
              <li>✅ Unlimited AI Summaries</li>
              <li>✅ Advanced SM2 Spaced Repetition</li>
              <li>✅ Clinic Clash Premium Rank</li>
              <li>✅ Priority Tutor Verification</li>
              <li>✅ Custom AI Medical Cases</li>
            </ul>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', fontSize: '1.1rem', padding: '16px' }} 
              onClick={handleSimulatedPayment}
              disabled={loading}
            >
              {loading ? 'Processing Payment...' : 'Upgrade Now (Test Mode)'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
