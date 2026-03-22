import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function TutorPortal() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnverifiedSummaries();
  }, []);

  const fetchUnverifiedSummaries = async () => {
    setLoading(true);
    // Fetch summaries that are not yet verified
    const { data, error } = await supabase
      .from('summaries')
      .select('*, notes(*)')
      .eq('verified', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching summaries:", error);
    } else if (data) {
      setSummaries(data);
      if (data.length > 0) setSelectedSummary(data[0]);
    }
    setLoading(false);
  };

  const approveSummary = async (id: string) => {
    const { error } = await supabase
      .from('summaries')
      .update({ verified: true })
      .eq('id', id);

    if (error) {
      console.error("Error approving summary:", error);
      alert("Failed to approve summary.");
    } else {
      const updated = summaries.filter(s => s.id !== id);
      setSummaries(updated);
      setSelectedSummary(updated.length > 0 ? updated[0] : null);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 24px' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Tutor Portal</h1>
          <p className="text-muted">Review, verify, and curate high-yield medical content.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '2rem' }}>
        {/* Left column - Queue */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Verification Queue</h3>
          {loading ? (
            <p className="text-muted text-sm" style={{ marginBottom: '1rem' }}>Loading summaries...</p>
          ) : (
            <p className="text-muted text-sm" style={{ marginBottom: '1rem' }}>
              {summaries.length} summaries await your review.
            </p>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {summaries.map((item) => {
              const isSelected = selectedSummary?.id === item.id;
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedSummary(item)}
                  style={{ 
                    padding: '1rem', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: 'var(--radius-md)', 
                    cursor: 'pointer', 
                    background: isSelected ? 'rgba(2, 132, 199, 0.05)' : 'transparent', 
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)' 
                  }}
                >
                  <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    Review Note: {item.notes?.id?.substring(0, 8) || 'N/A'}
                  </h4>
                  <p className="text-muted text-xs">Summary ID: {item.id.substring(0, 8)}</p>
                </div>
              );
            })}
            {!loading && summaries.length === 0 && (
              <p className="text-muted text-sm text-center" style={{ padding: '2rem 0' }}>
                No summaries pending review. You're all caught up!
              </p>
            )}
          </div>
        </div>

        {/* Right column - Verification Area */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {selectedSummary ? (
            <>
              <div className="flex-between" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Review Summary {selectedSummary.id.substring(0, 8)}</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>Flag Issue</button>
                  <button onClick={() => approveSummary(selectedSummary.id)} className="btn btn-primary" style={{ background: 'var(--color-success)', border: 'none', color: 'white' }}>Approve "High-Yield"</button>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h3 className="text-sm text-muted" style={{ marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Generated 5-Point Summary</h3>
                  <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Array.isArray(selectedSummary.ai_summary) ? (
                      selectedSummary.ai_summary.map((point: string, i: number) => (
                        <li key={i}>{point}</li>
                      ))
                    ) : (
                      <li>{selectedSummary.ai_summary}</li>
                    )}
                  </ul>
                </div>
                
                {selectedSummary.key_concepts && (
                  <div>
                    <h3 className="text-sm text-muted" style={{ marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Concepts</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {Object.entries(selectedSummary.key_concepts).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong> {value as string}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
               {loading ? 'Loading...' : 'Select a summary from the queue to review.'}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
