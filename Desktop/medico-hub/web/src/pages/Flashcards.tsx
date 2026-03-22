import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

export default function Flashcards() {
  const { user } = useAuthStore();
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Custom Card Form State
  const [showForm, setShowForm] = useState(false);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) fetchCards();
  }, [user]);

  const fetchCards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', user?.id)
      .lte('next_review_date', new Date().toISOString())
      .order('next_review_date', { ascending: true });

    if (error) {
      console.error("Error fetching flashcards:", error);
    } else if (data) {
      setCards(data);
    }
    setLoading(false);
  };

  const handleNext = async (difficulty: string) => {
    // Basic SM2-like scheduling simulation
    const daysToAdd = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 1 : 0;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);

    await supabase
      .from('flashcards')
      .update({ next_review_date: nextDate.toISOString() })
      .eq('id', cards[currentIndex].id);

    setIsFlipped(false);
    
    // Animate slightly before next card
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        fetchCards();
        setCurrentIndex(0);
      }
    }, 200);
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ || !newA || !user) return;
    setSaving(true);
    
    const { error } = await supabase.from('flashcards').insert({
      user_id: user.id,
      question: newQ,
      answer: newA,
      difficulty_level: 'medium',
    });
    
    setSaving(false);
    if (!error) {
      alert("Custom Flashcard Created!");
      setNewQ('');
      setNewA('');
      setShowForm(false);
      fetchCards();
    } else {
      alert("Error saving: " + error.message);
    }
  };

  if (loading) return <div className="container text-muted" style={{ padding: '4rem', textAlign: 'center' }}>Loading your study deck...</div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 24px', maxWidth: '800px', margin: '0 auto' }}>
      
      <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>Study Deck</h1>
          <p className="text-muted">Analyze, Recall, and Master. 🧠</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}>
            {showForm ? 'Cancel' : '+ Custom Card'}
          </button>
          <div style={{ padding: '0.75rem 1.5rem', background: 'var(--color-primary-dark)', borderRadius: '100px', color: 'black', fontWeight: 800, fontSize: '1rem', boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)' }}>
            {cards.length > 0 ? `${cards.length - currentIndex} Cards Left` : '0 Due'}
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreateCustom} className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--color-primary)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Create Custom Flashcard</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea 
              placeholder="Question/Front" 
              value={newQ} 
              onChange={e => setNewQ(e.target.value)} 
              rows={2} 
              required
            />
            <textarea 
              placeholder="Answer/Back" 
              value={newA} 
              onChange={e => setNewA(e.target.value)} 
              rows={3} 
              required
            />
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Card'}
            </button>
          </div>
        </form>
      )}

      {/* Main Study Deck Area */}
      {cards.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>You're all caught up! 🎉</h1>
          <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '1.25rem' }}>You have reviewed all due flashcards today. Upload notes or create custom cards!</p>
          <Link to="/dashboard" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1.1rem' }}>Back to Dashboard</Link>
        </div>
      ) : (
        <>
          <div 
            className="glass-panel" 
            style={{ 
              minHeight: '350px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: '4rem 3rem',
              cursor: isFlipped ? 'default' : 'pointer',
              textAlign: 'center',
              position: 'relative',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              background: isFlipped ? 'var(--color-surface)' : 'rgba(255, 255, 255, 0.02)',
              border: isFlipped ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              boxShadow: isFlipped ? '0 20px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,215,0,0.3)' : '0 10px 30px rgba(0,0,0,0.5)',
            }}
            onClick={() => !isFlipped && setIsFlipped(true)}
          >
            {!isFlipped ? (
               <div className="animate-fade-in" style={{ width: '100%' }}>
                  <span style={{ position: 'absolute', top: '24px', left: '24px', color: 'var(--color-primary)', fontWeight: 800, fontSize: '1.5rem', opacity: 0.5 }}>Q.</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 500, lineHeight: 1.4, color: 'var(--color-text)' }}>{cards[currentIndex].question}</h2>
                  <p className="text-muted" style={{ position: 'absolute', bottom: '24px', left: '0', width: '100%', fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Tap anywhere to reveal</p>
               </div>
            ) : (
               <div className="animate-fade-in" style={{ width: '100%' }}>
                  <span style={{ position: 'absolute', top: '24px', left: '24px', color: 'var(--color-success)', fontWeight: 800, fontSize: '1.5rem', opacity: 0.5 }}>A.</span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 400, color: 'var(--color-text-muted)', marginBottom: '2rem', fontStyle: 'italic' }}>{cards[currentIndex].question}</h2>
                  <div style={{ width: '60px', height: '4px', background: 'var(--color-primary)', margin: '0 auto 2rem', borderRadius: '4px' }} />
                  <p style={{ fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.5, color: 'var(--color-text)' }}>{cards[currentIndex].answer}</p>
               </div>
            )}
          </div>

          <div style={{ height: '80px', marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', opacity: isFlipped ? 1 : 0, transition: 'opacity 0.4s ease' }}>
            {isFlipped && (
              <>
                <button onClick={(e) => { e.stopPropagation(); handleNext('hard'); }} className="btn btn-secondary animate-fade-in" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)', fontSize: '1.1rem', padding: '12px 30px', flex: 1, maxWidth: '200px' }}>Hard <span style={{display: 'block', fontSize: '0.75rem', opacity: 0.7}}>Review soon</span></button>
                <button onClick={(e) => { e.stopPropagation(); handleNext('medium'); }} className="btn btn-secondary animate-fade-in" style={{ borderColor: 'var(--color-accent)', color: 'var(--color-text)', fontSize: '1.1rem', padding: '12px 30px', flex: 1, maxWidth: '200px' }}>Good <span style={{display: 'block', fontSize: '0.75rem', opacity: 0.7}}>1 Day</span></button>
                <button onClick={(e) => { e.stopPropagation(); handleNext('easy'); }} className="btn btn-primary animate-fade-in" style={{ padding: '12px 30px', flex: 1, maxWidth: '200px' }}>Easy <span style={{display: 'block', fontSize: '0.75rem', opacity: 0.8, color: 'rgba(0,0,0,0.6)'}}>4 Days</span></button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
