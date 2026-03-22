import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      transition: 'opacity 0.5s ease-out'
    }}>
      <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '2rem' }}>
        {/* Outer track circle */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: '4px solid rgba(255, 215, 0, 0.1)',
          borderRadius: '50%'
        }}></div>
        
        {/* Spinning progress arc */}
        <div className="loading-spinner-arc"></div>
      </div>

      <div style={{ 
        fontSize: '2.5rem', 
        fontWeight: 800, 
        letterSpacing: '-0.03em',
        display: 'flex',
        alignItems: 'center'
      }}>
        <span style={{ color: 'var(--color-text)' }}>Medico</span>
        <span style={{ color: 'var(--color-primary)' }}>Hub</span>
      </div>

      <style>{`
        .loading-spinner-arc {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 4px solid transparent;
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
