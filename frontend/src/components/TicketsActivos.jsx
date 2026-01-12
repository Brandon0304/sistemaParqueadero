import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketService from '../services/ticketService';
import QRScanner from './QRScanner';

const TicketsActivos = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ticketBuscado, setTicketBuscado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarTicketsActivos();
  }, []);

  const cargarTicketsActivos = async () => {
    try {
      const data = await TicketService.listarActivos();
      setTickets(data);
    } catch (err) {
      setError('Error al cargar los tickets activos');
    } finally {
      setLoading(false);
    }
  };

  const calcularTiempo = (fechaEntrada) => {
    const entrada = new Date(fechaEntrada);
    const ahora = new Date();
    const diff = ahora - entrada;
    
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas}h ${minutos}m`;
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES');
  };

  const handleQRScan = async (codigo) => {
    try {
      const ticket = await TicketService.obtenerPorCodigo(codigo);
      if (ticket.estado === 'ACTIVO') {
        setTicketBuscado(ticket);
        setSuccess(`Ticket encontrado: ${codigo}`);
        setTimeout(() => {
          setSuccess('');
          setTicketBuscado(null);
        }, 5000);
      } else {
        setError(`El ticket ${codigo} no está activo`);
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Ticket no encontrado');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div>
      <div className="header">
        <h1>Tickets Activos</h1>
        <div className="nav">
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            Volver
          </button>
          <button onClick={cargarTicketsActivos} className="btn btn-primary">
            Actualizar
          </button>
        </div>
      </div>

      <div className="container">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 className="card-title">Buscar Ticket por QR</h3>
          <QRScanner 
            onScan={handleQRScan}
            onError={(err) => setError('Error al escanear QR')}
          />
        </div>

        {ticketBuscado && (
          <div className="card" style={{ marginBottom: '20px', background: '#f0fdf4', border: '2px solid #10b981' }}>
            <h3 className="card-title">Ticket Encontrado</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#059669' }}>{ticketBuscado.placaVehiculo}</h3>
              <span className="badge badge-success">{ticketBuscado.estado}</span>
            </div>
            <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #10b981' }} />
            <p style={{ marginBottom: '8px', fontSize: '0.875rem' }}><strong>Código:</strong> {ticketBuscado.codigo}</p>
            <p style={{ marginBottom: '8px', fontSize: '0.875rem' }}><strong>Tipo:</strong> <span className="badge badge-info">{ticketBuscado.tipoVehiculo}</span></p>
            <p style={{ marginBottom: '8px', fontSize: '0.875rem' }}><strong>Entrada:</strong> {formatFecha(ticketBuscado.fechaHoraEntrada)}</p>
            <p style={{ marginBottom: '8px', fontSize: '0.875rem' }}><strong>Tiempo transcurrido:</strong> {calcularTiempo(ticketBuscado.fechaHoraEntrada)}</p>
          </div>
        )}

        <div className="card">
          <h3 className="card-title">
            Vehículos en el Parqueadero: 
            <span className="badge badge-success" style={{ marginLeft: '10px' }}>
              {tickets.length}
            </span>
          </h3>
          
          {tickets.length === 0 ? (
            <div className="alert alert-info">
              No hay vehículos en el parqueadero actualmente
            </div>
          ) : (
            <div className="grid">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{ticket.placaVehiculo}</h3>
                    <span className="badge badge-success">{ticket.estado}</span>
                  </div>
                  <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                  <p style={{ marginBottom: '8px', fontSize: '0.875rem' }}><strong>Código:</strong> {ticket.codigo}</p>
                  <p style={{ marginBottom: '8px', fontSize: '0.875rem' }}><strong>Tipo:</strong> <span className="badge badge-info">{ticket.tipoVehiculo}</span></p>
                  <p style={{ marginBottom: '8px', fontSize: '0.875rem' }}><strong>Entrada:</strong> {formatFecha(ticket.fechaHoraEntrada)}</p>
                  <p style={{ marginBottom: '8px', fontSize: '0.875rem' }}><strong>Tiempo transcurrido:</strong> {calcularTiempo(ticket.fechaHoraEntrada)}</p>
                  <p style={{ marginBottom: '0', fontSize: '0.875rem' }}><strong>Operador:</strong> {ticket.usuarioEntrada}</p>
                  {ticket.observaciones && (
                    <p><strong>Observaciones:</strong> {ticket.observaciones}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketsActivos;
