const VerifiedBadge = ({ isVerified, trustScore }) => {
  if (!isVerified && !trustScore) return null;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      {isVerified && (
        <span 
          title="Verified Company Profile"
          style={{ 
            backgroundColor: '#ecfdf5', 
            color: '#047857', 
            padding: '2px 8px', 
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Verified
        </span>
      )}
      
      {trustScore > 0 && (
        <span 
          title="Trust Score"
          style={{ 
            backgroundColor: '#fffbeb', 
            color: '#d97706', 
            padding: '2px 8px', 
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          ⭐ {trustScore}
        </span>
      )}
    </div>
  );
};

export default VerifiedBadge;
