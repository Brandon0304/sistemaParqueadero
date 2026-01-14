import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Cargando...' }) => {
  const sizeClasses = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.medium;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      gap: '12px'
    }}>
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      {message && (
        <p style={{ 
          margin: 0, 
          color: '#6b7280', 
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          {message}
        </p>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
