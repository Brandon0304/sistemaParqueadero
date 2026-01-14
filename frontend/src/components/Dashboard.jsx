import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import configuracionService from '../services/configuracionService';
import EstadisticasService from '../services/estadisticasService';
import LoadingSpinner from './LoadingSpinner';
import SkeletonLoader from './SkeletonLoader';
import GraficoOcupacion from './graficos/GraficoOcupacion';
import GraficoIngresos from './graficos/GraficoIngresos';
import GraficoDistribucion from './graficos/GraficoDistribucion';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [espacios, setEspacios] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [ocupacion, setOcupacion] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [distribucion, setDistribucion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      setError(null);
      
      // Cargar todos los datos en paralelo
      const [
        espaciosData,
        resumenData,
        ocupacionData,
        ingresosData,
        distribucionData
      ] = await Promise.all([
        configuracionService.obtenerEspaciosDisponibles(),
        EstadisticasService.obtenerResumenHoy(),
        EstadisticasService.obtenerOcupacionPorHora(),
        EstadisticasService.obtenerIngresosDiarios(),
        EstadisticasService.obtenerDistribucionVehiculos()
      ]);
      
      setEspacios(espaciosData.espacios);
      setResumen(resumenData);
      setOcupacion(ocupacionData);
      setIngresos(ingresosData);
      setDistribucion(distribucionData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      const mensaje = 'No se pudieron cargar los datos del dashboard';
      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const getColorByPercentage = (porcentaje) => {
    if (porcentaje >= 80) return '#dc2626'; // rojo
    if (porcentaje >= 50) return '#f59e0b'; // amarillo/naranja
    return '#10b981'; // verde
  };

  const getEstadoTexto = (porcentaje) => {
    if (porcentaje >= 80) return 'CRÍTICO';
    if (porcentaje >= 50) return 'MEDIO';
    return 'DISPONIBLE';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <div className="header">
        <h1>Sistema de Gestión de Parqueadero</h1>
        <p style={{ marginTop: '8px', fontSize: '0.875rem', opacity: '0.9' }}>
          Usuario: {user?.username} | Rol: {user?.roles?.join(', ')}
        </p>
        
        <div className="nav">
          <button onClick={() => navigate('/vehiculos')} className="btn btn-primary">
            Vehículos
          </button>
          <button onClick={() => navigate('/tickets')} className="btn btn-primary">
            Tickets
          </button>
          <button onClick={() => navigate('/tickets/activos')} className="btn btn-success">
            Tickets Activos
          </button>
          <button onClick={handleLogout} className="btn btn-secondary">
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="container">
        {/* Indicador de Espacios Disponibles */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>
            📊 Disponibilidad de Espacios
          </h2>
          
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <SkeletonLoader type="card" />
              <SkeletonLoader type="card" />
              <SkeletonLoader type="card" />
              <SkeletonLoader type="card" />
            </div>
          )}
          
          {!loading && error && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>
          )}
          
          {!loading && espacios && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {Object.entries(espacios).map(([tipo, detalle]) => {
                const color = getColorByPercentage(detalle.porcentajeOcupacion);
                const estado = getEstadoTexto(detalle.porcentajeOcupacion);
                
                return (
                  <div key={tipo} style={{ 
                    padding: '16px', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <h3 style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600',
                        margin: 0
                      }}>
                        {tipo === 'AUTO' && '🚗'} 
                        {tipo === 'MOTO' && '🏍️'} 
                        {tipo === 'BICICLETA' && '🚲'} 
                        {tipo === 'CAMION' && '🚚'} 
                        {' '}{tipo}
                      </h3>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '600',
                        color: color,
                        padding: '2px 8px',
                        backgroundColor: `${color}20`,
                        borderRadius: '4px'
                      }}>
                        {estado}
                      </span>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div style={{
                      width: '100%',
                      height: '24px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        width: `${detalle.porcentajeOcupacion}%`,
                        height: '100%',
                        backgroundColor: color,
                        transition: 'width 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'white'
                      }}>
                        {detalle.porcentajeOcupacion > 15 && `${detalle.porcentajeOcupacion.toFixed(0)}%`}
                      </div>
                    </div>
                    
                    {/* Información detallada */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: '#4b5563'
                    }}>
                      <span>
                        <strong style={{ color: '#1f2937' }}>{detalle.disponibles}</strong> disponibles
                      </span>
                      <span>
                        <strong style={{ color: '#1f2937' }}>{detalle.ocupados}</strong>/{detalle.total}
                      </span>
                    </div>
                    
                    {detalle.disponibles === 0 && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: '#dc2626',
                        fontWeight: '600',
                        textAlign: 'center'
                      }}>
                        ⚠️ CAPACIDAD COMPLETA
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* KPIs del día */}
        {!loading && resumen && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>
              📈 Resumen del Día
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              {/* Vehículos Activos */}
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#eff6ff', 
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🚗</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e40af', marginBottom: '4px' }}>
                  {resumen.vehiculosActivos}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#4b5563', fontWeight: '500' }}>
                  Vehículos Activos
                </div>
              </div>

              {/* Vehículos Salidos */}
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f0fdf4', 
                border: '2px solid #10b981',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#047857', marginBottom: '4px' }}>
                  {resumen.vehiculosSalidos}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#4b5563', fontWeight: '500' }}>
                  Salidas Hoy
                </div>
              </div>

              {/* Ingresos del Día */}
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#fefce8', 
                border: '2px solid #eab308',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💰</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#a16207', marginBottom: '4px' }}>
                  ${resumen.ingresosHoy.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#4b5563', fontWeight: '500' }}>
                  Ingresos Hoy
                </div>
              </div>

              {/* Tiempo Promedio */}
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#faf5ff', 
                border: '2px solid #a855f7',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏱️</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#7e22ce', marginBottom: '4px' }}>
                  {resumen.tiempoPromedioMinutos.toFixed(0)}m
                </div>
                <div style={{ fontSize: '0.75rem', color: '#4b5563', fontWeight: '500' }}>
                  Tiempo Promedio
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gráficos */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <GraficoOcupacion datos={ocupacion} />
            <GraficoIngresos datos={ingresos} />
          </div>
        )}

        {!loading && distribucion.length > 0 && (
          <div style={{ marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
            <GraficoDistribucion datos={distribucion} />
          </div>
        )}

        <h2 style={{ marginBottom: '24px', fontSize: '1.25rem', fontWeight: '600' }}>Panel de Control</h2>
        <div className="grid">
          <div className="card">
            <h3 className="card-title">Gestión de Vehículos</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '0.875rem' }}>
              Registra y administra los vehículos del parqueadero
            </p>
            <button onClick={() => navigate('/vehiculos')} className="btn btn-primary">
              Acceder
            </button>
          </div>

          <div className="card">
            <h3 className="card-title">Gestión de Tickets</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '0.875rem' }}>
              Gestiona las entradas y salidas del parqueadero
            </p>
            <button onClick={() => navigate('/tickets')} className="btn btn-primary">
              Acceder
            </button>
          </div>

          <div className="card">
            <h3 className="card-title">Tickets Activos</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '0.875rem' }}>
              Visualiza los vehículos actualmente en el parqueadero
            </p>
            <button onClick={() => navigate('/tickets/activos')} className="btn btn-success">
              Ver Activos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
