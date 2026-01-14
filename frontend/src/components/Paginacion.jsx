import React from 'react';

const Paginacion = ({ paginaActual, totalPaginas, totalElementos, onCambiarPagina }) => {
  const handleAnterior = () => {
    if (paginaActual > 0) {
      onCambiarPagina(paginaActual - 1);
    }
  };

  const handleSiguiente = () => {
    if (paginaActual < totalPaginas - 1) {
      onCambiarPagina(paginaActual + 1);
    }
  };

  const handlePrimeraPagina = () => {
    onCambiarPagina(0);
  };

  const handleUltimaPagina = () => {
    onCambiarPagina(totalPaginas - 1);
  };

  if (totalPaginas <= 1) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: '20px',
      padding: '16px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    }}>
      {/* Información de Resultados */}
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        Mostrando página <strong>{paginaActual + 1}</strong> de <strong>{totalPaginas}</strong>
        {' '}({totalElementos} {totalElementos === 1 ? 'resultado' : 'resultados'})
      </div>

      {/* Botones de Navegación */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handlePrimeraPagina}
          disabled={paginaActual === 0}
          className="btn btn-secondary"
          style={{ fontSize: '0.875rem', padding: '6px 12px' }}
          title="Primera página"
        >
          ⏮️
        </button>
        
        <button
          onClick={handleAnterior}
          disabled={paginaActual === 0}
          className="btn btn-secondary"
          style={{ fontSize: '0.875rem', padding: '6px 12px' }}
        >
          ⬅️ Anterior
        </button>

        <button
          onClick={handleSiguiente}
          disabled={paginaActual >= totalPaginas - 1}
          className="btn btn-secondary"
          style={{ fontSize: '0.875rem', padding: '6px 12px' }}
        >
          Siguiente ➡️
        </button>

        <button
          onClick={handleUltimaPagina}
          disabled={paginaActual >= totalPaginas - 1}
          className="btn btn-secondary"
          style={{ fontSize: '0.875rem', padding: '6px 12px' }}
          title="Última página"
        >
          ⏭️
        </button>
      </div>
    </div>
  );
};

export default Paginacion;
