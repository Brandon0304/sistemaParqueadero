import React from 'react';

const ModalAlertas = ({ alertas, onClose }) => {
    if (!alertas || alertas.length === 0) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                    <div className="modal-header">
                        <h2>🔔 Alertas del Sistema</h2>
                        <button onClick={onClose} className="btn-close">✖</button>
                    </div>
                    <div className="modal-body">
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '40px 20px',
                            color: '#10b981'
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Todo en orden</h3>
                            <p style={{ color: '#6b7280' }}>No hay alertas activas en este momento</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getColorByTipo = (tipo) => {
        if (tipo === 'CRITICO') return '#dc2626';
        if (tipo === 'ADVERTENCIA') return '#f59e0b';
        return '#3b82f6';
    };

    const getIconByTipo = (tipo) => {
        if (tipo === 'CRITICO') return '🚨';
        if (tipo === 'ADVERTENCIA') return '⚠️';
        return 'ℹ️';
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <h2>🔔 Alertas del Sistema ({alertas.length})</h2>
                    <button onClick={onClose} className="btn-close">✖</button>
                </div>
                <div className="modal-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {alertas.map((alerta, index) => (
                            <div 
                                key={index}
                                style={{
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: `2px solid ${getColorByTipo(alerta.tipo)}`,
                                    backgroundColor: `${getColorByTipo(alerta.tipo)}10`
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                                    <div style={{ fontSize: '2rem', lineHeight: 1 }}>
                                        {getIconByTipo(alerta.tipo)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '8px'
                                        }}>
                                            <span style={{ 
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                color: getColorByTipo(alerta.tipo),
                                                backgroundColor: 'white',
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                border: `1px solid ${getColorByTipo(alerta.tipo)}`
                                            }}>
                                                {alerta.tipo}
                                            </span>
                                            <span style={{ 
                                                fontSize: '0.875rem',
                                                color: '#6b7280',
                                                fontWeight: '600'
                                            }}>
                                                {alerta.tipoVehiculo}
                                            </span>
                                        </div>
                                        <p style={{ 
                                            margin: '8px 0',
                                            fontSize: '0.95rem',
                                            fontWeight: '500',
                                            color: '#1f2937'
                                        }}>
                                            {alerta.mensaje}
                                        </p>
                                        <div style={{ 
                                            display: 'flex', 
                                            gap: '16px',
                                            marginTop: '12px',
                                            fontSize: '0.875rem'
                                        }}>
                                            <div>
                                                <span style={{ color: '#6b7280' }}>Disponibles: </span>
                                                <strong style={{ color: getColorByTipo(alerta.tipo) }}>
                                                    {alerta.disponibles}
                                                </strong>
                                            </div>
                                            <div>
                                                <span style={{ color: '#6b7280' }}>Total: </span>
                                                <strong>{alerta.total}</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: '#6b7280' }}>Ocupación: </span>
                                                <strong style={{ color: getColorByTipo(alerta.tipo) }}>
                                                    {alerta.porcentajeOcupacion}%
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalAlertas;
