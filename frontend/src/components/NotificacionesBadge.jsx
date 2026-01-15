import { useState, useEffect } from 'react';
import AlertasService from '../services/alertasService';
import './NotificacionesBadge.css';

const NotificacionesBadge = () => {
    const [contador, setContador] = useState({ criticas: 0, advertencias: 0, total: 0 });
    const [alertas, setAlertas] = useState([]);
    const [mostrarDropdown, setMostrarDropdown] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        cargarContador();
        // Actualizar cada 30 segundos
        const interval = setInterval(cargarContador, 30000);
        return () => clearInterval(interval);
    }, []);

    const cargarContador = async () => {
        try {
            const data = await AlertasService.obtenerContador();
            setContador(data);
        } catch (error) {
            console.error('Error al cargar contador de alertas:', error);
        }
    };

    const cargarAlertas = async () => {
        try {
            setLoading(true);
            const data = await AlertasService.obtenerEspaciosCriticos();
            setAlertas(data);
        } catch (error) {
            console.error('Error al cargar alertas:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDropdown = () => {
        if (!mostrarDropdown) {
            cargarAlertas();
        }
        setMostrarDropdown(!mostrarDropdown);
    };

    const getBadgeColor = () => {
        if (contador.criticas > 0) return '#dc2626'; // rojo
        if (contador.advertencias > 0) return '#f59e0b'; // naranja
        return '#10b981'; // verde
    };

    return (
        <div className="notificaciones-container">
            <button 
                className="notificaciones-badge" 
                onClick={toggleDropdown}
                style={{ backgroundColor: getBadgeColor() }}
            >
                🔔
                {contador.total > 0 && (
                    <span className="badge-count">{contador.total}</span>
                )}
            </button>

            {mostrarDropdown && (
                <>
                    <div className="notificaciones-overlay" onClick={toggleDropdown}></div>
                    <div className="notificaciones-dropdown">
                        <div className="notificaciones-header">
                            <h3>🔔 Alertas del Sistema</h3>
                            <button className="close-btn" onClick={toggleDropdown}>✕</button>
                        </div>
                        
                        {loading ? (
                            <div className="notificaciones-loading">Cargando...</div>
                        ) : alertas.length === 0 ? (
                            <div className="notificaciones-empty">
                                <div className="empty-icon">✅</div>
                                <p>No hay alertas activas</p>
                                <small>Todos los espacios están en niveles normales</small>
                            </div>
                        ) : (
                            <div className="notificaciones-list">
                                {alertas.map((alerta, index) => (
                                    <div 
                                        key={index} 
                                        className={`notificacion-item ${alerta.tipo.toLowerCase()}`}
                                    >
                                        <div className="notificacion-icon">
                                            {alerta.tipo === 'CRITICO' ? '🔴' : '⚠️'}
                                        </div>
                                        <div className="notificacion-content">
                                            <div className="notificacion-mensaje">
                                                {alerta.mensaje}
                                            </div>
                                            <div className="notificacion-detalle">
                                                {alerta.ocupados}/{alerta.capacidadTotal} espacios ocupados
                                            </div>
                                        </div>
                                        <div className="notificacion-porcentaje">
                                            {alerta.porcentajeOcupacion}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="notificaciones-footer">
                            <small>
                                {contador.criticas > 0 && `🔴 ${contador.criticas} crítica${contador.criticas > 1 ? 's' : ''}`}
                                {contador.criticas > 0 && contador.advertencias > 0 && ' • '}
                                {contador.advertencias > 0 && `⚠️ ${contador.advertencias} advertencia${contador.advertencias > 1 ? 's' : ''}`}
                            </small>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificacionesBadge;
