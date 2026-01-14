import React from 'react';

const SkeletonLoader = ({ type = 'text', count = 1, height = '20px' }) => {
  const skeletonStyle = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'loading 1.5s ease-in-out infinite',
    borderRadius: '4px',
    marginBottom: '12px',
    height: height
  };

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ ...skeletonStyle, height: '24px', width: '60%', marginBottom: '12px' }} />
            <div style={{ ...skeletonStyle, height: '16px', width: '100%', marginBottom: '8px' }} />
            <div style={{ ...skeletonStyle, height: '16px', width: '80%', marginBottom: '8px' }} />
            <div style={{ ...skeletonStyle, height: '36px', width: '120px', marginTop: '16px' }} />
          </div>
        );
      
      case 'table':
        return (
          <div style={{ marginBottom: '16px' }}>
            {[...Array(5)].map((_, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <div style={{ ...skeletonStyle, height: '40px', flex: 1 }} />
                <div style={{ ...skeletonStyle, height: '40px', flex: 1 }} />
                <div style={{ ...skeletonStyle, height: '40px', flex: 1 }} />
                <div style={{ ...skeletonStyle, height: '40px', width: '100px' }} />
              </div>
            ))}
          </div>
        );
      
      case 'text':
      default:
        return (
          <>
            {[...Array(count)].map((_, idx) => (
              <div key={idx} style={skeletonStyle} />
            ))}
          </>
        );
    }
  };

  return (
    <>
      {renderSkeleton()}
      <style>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
};

export default SkeletonLoader;
