import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TicketService from '../services/ticketService';
import QRScanner from './QRScanner';
import ConfirmModal from './ConfirmModal';
import LoadingSpinner from './LoadingSpinner';
import FiltrosTickets from './FiltrosTickets';
import Paginacion from './Paginacion';
import { formatearCOP } from '../utils/moneda';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEntrada, setShowEntrada] = useState(false);
  const [showSalida, setShowSalida] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [datosEntrada, setDatosEntrada] = useState({
    placa: '',
    tipo: 'AUTO',
    marca: '',
    modelo: '',
    color: '',
    observaciones: ''
  });
  const [codigoSalida, setCodigoSalida] = useState('');
  const [tarifaCalculada, setTarifaCalculada] = useState(null);
  const [mostrarInfoTicket, setMostrarInfoTicket] = useState(false); // Nuevo: controlar visibilidad del ticket escaneado
  const [ticketRecienCreado, setTicketRecienCreado] = useState(null); // Para mostrar botón de ticket
  const [ticketRecienPagado, setTicketRecienPagado] = useState(null); // Para mostrar botón de factura
  
  // Estados para filtros y paginación
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    tipoVehiculo: '',
    estado: '',
    placa: '',
    page: 0,
    size: 20
  });
  const [paginaInfo, setPaginaInfo] = useState({
    totalElements: 0,
    totalPages: 0,
    page: 0,
    size: 20,
    first: true,
    last: true
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, [filtros.page]); // Recargar cuando cambie la página

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Si hay filtros activos, usar endpoint de filtros
      const hayFiltrosActivos = filtros.fechaDesde || filtros.fechaHasta || 
                                filtros.tipoVehiculo || filtros.estado || filtros.placa;
      
      let ticketsData;
      if (hayFiltrosActivos || mostrarFiltros) {
        // Usar endpoint con filtros y paginación
        const response = await TicketService.listarConFiltros(filtros);
        ticketsData = response.content;
        setPaginaInfo({
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          page: response.page,
          size: response.size,
          first: response.first,
          last: response.last
        });
      } else {
        // Usar endpoint sin filtros (todos los tickets)
        ticketsData = await TicketService.listarTodos();
        setPaginaInfo({
          totalElements: ticketsData.length,
          totalPages: 1,
          page: 0,
          size: ticketsData.length,
          first: true,
          last: true
        });
      }
      
      setTickets(ticketsData);
      setError('');
    } catch (err) {
      const mensaje = 'Error al cargar los datos';
      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleEntrada = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        placa: datosEntrada.placa.trim(),
        tipo: datosEntrada.tipo,
        marca: datosEntrada.marca.trim() || null,
        modelo: datosEntrada.modelo.trim() || null,
        color: datosEntrada.color.trim() || null,
        observaciones: datosEntrada.observaciones.trim() || null
      };
      
      if (!payload.placa || payload.placa.length < 5) {
        toast.warning('La placa debe tener al menos 5 caracteres');
        return;
      }
      
      const response = await TicketService.registrarEntrada(payload);
      setTicketRecienCreado(response); // Guardamos el ticket para mostrar botón de descarga
      toast.success('✅ Entrada registrada exitosamente');
      // No cerramos el modal inmediatamente para permitir descargar el ticket
      setDatosEntrada({ placa: '', tipo: 'AUTO', marca: '', modelo: '', color: '', observaciones: '' });
      setError('');
      cargarDatos();
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error al registrar la entrada';
      setError(mensaje);
      toast.error(mensaje);
    }
  };

  const calcularTarifa = async () => {
    try {
      const tarifa = await TicketService.calcularTarifa(codigoSalida);
      setTarifaCalculada(tarifa);
      toast.info('Tarifa calculada correctamente');
    } catch (err) {
      const mensaje = 'Error al calcular la tarifa';
      toast.error(mensaje);
    }
  };

  const handleSalida = async () => {
    try {
      const response = await TicketService.registrarSalida(codigoSalida);
      setTicketRecienPagado(response); // Guardamos el ticket para mostrar botón de factura
      toast.success('✅ Salida registrada y pago procesado');
      // No cerramos el modal inmediatamente para permitir descargar la factura
      setCodigoSalida('');
      setTarifaCalculada(null);
      setError('');
      cargarDatos();
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error al registrar la salida';
      setError(mensaje);
      toast.error(mensaje);
    }
  };
  
  // Función para descargar el TICKET DE ENTRADA (PDF con QR)
  const descargarTicketEntrada = async (codigo) => {
    try {
      const response = await fetch(`http://localhost:8082/api/tickets/${codigo}/ticket-entrada`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Error al descargar el ticket');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-entrada-${codigo}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('✅ Ticket descargado');
    } catch (err) {
      toast.error('Error al descargar el ticket');
    }
  };

  // Función para descargar la FACTURA DE PAGO
  const descargarFacturaPago = async (codigo) => {
    try {
      const response = await fetch(`http://localhost:8082/api/tickets/${codigo}/factura-pago`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Error al descargar la factura');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${codigo}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('✅ Factura descargada');
    } catch (err) {
      toast.error('Error al descargar la factura');
    }
  };

  // Función para cerrar modal de entrada y limpiar ticket creado
  const cerrarModalEntrada = () => {
    setShowEntrada(false);
    setTicketRecienCreado(null);
    setDatosEntrada({ placa: '', tipo: 'AUTO', marca: '', modelo: '', color: '', observaciones: '' });
  };

  // Función para cerrar modal de salida y limpiar ticket pagado
  const cerrarModalSalida = () => {
    setShowSalida(false);
    setShowConfirmModal(false);
    setTicketRecienPagado(null);
  };
  
  const confirmarSalida = () => {
    if (!tarifaCalculada) {
      toast.warning('Debe calcular la tarifa antes de registrar la salida');
      return;
    }
    setShowConfirmModal(true);
  };

  // Handlers para filtros y paginación
  const handleFiltrosChange = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
  };

  const handleBuscarConFiltros = () => {
    setFiltros({ ...filtros, page: 0 }); // Resetear a página 0 al buscar
    cargarDatos();
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      fechaDesde: '',
      fechaHasta: '',
      tipoVehiculo: '',
      estado: '',
      placa: '',
      page: 0,
      size: 20
    });
    setMostrarFiltros(false);
    // Esperar a que se actualice el estado antes de recargar
    setTimeout(() => cargarDatos(), 100);
  };

  const handleCambiarPagina = (nuevaPagina) => {
    setFiltros({ ...filtros, page: nuevaPagina });
  };

  const handleExportarExcel = async () => {
    try {
      setLoading(true);
      toast.info('Generando archivo Excel...');
      
      // Usar filtros actuales (sin paginación)
      const filtrosExport = {
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta,
        tipoVehiculo: filtros.tipoVehiculo,
        estado: filtros.estado,
        placa: filtros.placa
      };
      
      await TicketService.exportarExcel(filtrosExport);
      toast.success('✅ Archivo Excel descargado correctamente');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      toast.error('Error al exportar archivo Excel');
    } finally {
      setLoading(false);
    }
  };

  const handleExportarPDF = async () => {
    try {
      setLoading(true);
      toast.info('Generando archivo PDF...');
      
      // Usar filtros actuales (sin paginación)
      const filtrosExport = {
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta,
        tipoVehiculo: filtros.tipoVehiculo,
        estado: filtros.estado,
        placa: filtros.placa
      };
      
      await TicketService.exportarPDF(filtrosExport);
      toast.success('✅ Archivo PDF descargado correctamente');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      toast.error('Error al exportar archivo PDF');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      ACTIVO: 'badge-success',
      PAGADO: 'badge-info',
      CANCELADO: 'badge-danger'
    };
    return badges[estado] || 'badge-warning';
  };

  const formatFecha = (fecha) => {
    return fecha ? new Date(fecha).toLocaleString('es-ES') : '-';
  };

  const handleDescargarFactura = async (codigo) => {
    try {
      await TicketService.descargarFactura(codigo);
      toast.success('📄 Factura descargada exitosamente');
    } catch (err) {
      toast.error('Error al descargar la factura');
    }
  };

  const handleQRScan = async (codigo) => {
    setCodigoSalida(codigo);
    try {
      const tarifa = await TicketService.calcularTarifa(codigo);
      setTarifaCalculada(tarifa);
      setMostrarInfoTicket(true); // Mostrar la info de manera persistente
      toast.success(`✅ Ticket ${codigo} escaneado correctamente`);
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Ticket no encontrado o no está activo';
      setError(mensaje);
      toast.error(mensaje);
      setTimeout(() => setError(''), 5000);
    }
  };

  if (loading) return <LoadingSpinner message="Cargando tickets..." />;

  return (
    <div>
      <div className="header">
        <h1>Gestión de Tickets</h1>
        <div className="nav">
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            Volver
          </button>
          <button 
            onClick={() => setMostrarFiltros(!mostrarFiltros)} 
            className="btn btn-primary"
            style={{ marginRight: '10px' }}
          >
            {mostrarFiltros ? '🔍 Ocultar Filtros' : '🔍 Mostrar Filtros'}
          </button>
          <button 
            onClick={handleExportarExcel} 
            className="btn btn-success"
            style={{ marginRight: '10px' }}
            disabled={loading}
          >
            📊 Exportar Excel
          </button>
          <button 
            onClick={handleExportarPDF} 
            className="btn btn-success"
            style={{ marginRight: '10px' }}
            disabled={loading}
          >
            📄 Exportar PDF
          </button>
          <button onClick={() => setShowEntrada(!showEntrada)} className="btn btn-success">
            {showEntrada ? 'Cancelar' : 'Registrar Entrada'}
          </button>
          <button onClick={() => setShowSalida(!showSalida)} className="btn btn-danger">
            {showSalida ? 'Cancelar' : 'Registrar Salida'}
          </button>
        </div>
      </div>

      <div className="container">
        {/* Componente de Filtros */}
        {mostrarFiltros && (
          <FiltrosTickets
            filtros={filtros}
            onFiltrosChange={handleFiltrosChange}
            onBuscar={handleBuscarConFiltros}
            onLimpiar={handleLimpiarFiltros}
          />
        )}

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {showEntrada && (
          <div className="card">
            <h3 className="card-title">Registrar Entrada</h3>
            <form onSubmit={handleEntrada}>
              <div className="form-group">
                <label>Placa del Vehículo *</label>
                <input
                  type="text"
                  value={datosEntrada.placa}
                  onChange={(e) => setDatosEntrada({ ...datosEntrada, placa: e.target.value.toUpperCase() })}
                  placeholder="Ej: ABC123, XYZ789"
                  required
                  minLength={5}
                  maxLength={10}
                  style={{ textTransform: 'uppercase' }}
                />
                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                  💡 Si el vehículo ya existe, se asociará automáticamente. Si no existe, se creará uno nuevo.
                </small>
              </div>

              <div className="form-group">
                <label>Tipo de Vehículo *</label>
                <select
                  value={datosEntrada.tipo}
                  onChange={(e) => setDatosEntrada({ ...datosEntrada, tipo: e.target.value })}
                  required
                >
                  <option value="AUTO">Auto</option>
                  <option value="MOTO">Moto</option>
                  <option value="BICICLETA">Bicicleta</option>
                  <option value="CAMION">Camión</option>
                </select>
              </div>

              <div className="form-group">
                <label>Marca</label>
                <input
                  type="text"
                  value={datosEntrada.marca}
                  onChange={(e) => setDatosEntrada({ ...datosEntrada, marca: e.target.value })}
                  placeholder="Ej: Toyota, Honda, Yamaha..."
                />
              </div>

              <div className="form-group">
                <label>Modelo</label>
                <input
                  type="text"
                  value={datosEntrada.modelo}
                  onChange={(e) => setDatosEntrada({ ...datosEntrada, modelo: e.target.value })}
                  placeholder="Ej: Corolla, Civic, R6..."
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  value={datosEntrada.color}
                  onChange={(e) => setDatosEntrada({ ...datosEntrada, color: e.target.value })}
                  placeholder="Ej: Rojo, Azul, Negro..."
                />
              </div>

              <div className="form-group">
                <label>Observaciones</label>
                <textarea
                  value={datosEntrada.observaciones}
                  onChange={(e) => setDatosEntrada({ ...datosEntrada, observaciones: e.target.value })}
                  placeholder="Información adicional..."
                  rows={3}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-success"
                style={{ width: '100%' }}
              >
                🚗 Registrar Entrada
              </button>
            </form>

            {/* Mostrar botón de descargar ticket después de registrar */}
            {ticketRecienCreado && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '4px'
              }}>
                <h4 style={{ color: '#155724', marginBottom: '10px' }}>
                  ✅ Entrada Registrada: {ticketRecienCreado.codigo}
                </h4>
                <p style={{ marginBottom: '15px', color: '#155724' }}>
                  Descargue el ticket para entregar al cliente. El código QR puede escanearse al momento de la salida.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => descargarTicketEntrada(ticketRecienCreado.codigo)}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    📄 Descargar Ticket de Entrada (PDF con QR)
                  </button>
                  <button
                    onClick={cerrarModalEntrada}
                    className="btn btn-secondary"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {showSalida && (
          <div className="card">
            <h3 className="card-title">Registrar Salida</h3>
            
            <QRScanner 
              onScan={handleQRScan}
              onError={(err) => setError('Error al escanear QR')}
            />

            {mostrarInfoTicket && tarifaCalculada && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: '#e3f2fd',
                border: '2px solid #2196f3',
                borderRadius: '8px',
                position: 'relative'
              }}>
                <button
                  onClick={() => {
                    setMostrarInfoTicket(false);
                    setTarifaCalculada(null);
                    setCodigoSalida('');
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Cerrar"
                >
                  ×
                </button>
                
                <h4 style={{ marginTop: 0, color: '#1976d2', marginBottom: '15px' }}>
                  📋 Información del Ticket: {codigoSalida}
                </h4>
                
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '15px', 
                  borderRadius: '6px',
                  marginBottom: '15px'
                }}>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Placa:</strong> {tarifaCalculada.vehiculoPlaca || 'N/A'}
                  </p>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Tipo de Vehículo:</strong> {tarifaCalculada.tipoVehiculo}
                  </p>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Tiempo Estacionado:</strong> {tarifaCalculada.detalleCalculo}
                  </p>
                  <p style={{ 
                    margin: '8px 0',
                    fontSize: '1.25rem',
                    color: '#2e7d32',
                    fontWeight: 'bold'
                  }}>
                    <strong>💰 Monto a Pagar:</strong> {formatearCOP(tarifaCalculada.montoTotal)}
                  </p>
                </div>
                
                <button onClick={confirmarSalida} className="btn btn-success" style={{ width: '100%', padding: '12px' }}>
                  ✅ Confirmar Salida y Procesar Pago
                </button>
              </div>
            )}

            {!mostrarInfoTicket && (
              <button onClick={calcularTarifa} className="btn btn-primary" disabled={!codigoSalida} style={{ marginTop: '15px' }}>
                Calcular Tarifa
              </button>
            )}

            {/* Mostrar botón de descargar factura después de pagar */}
            {ticketRecienPagado && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '4px'
              }}>
                <h4 style={{ color: '#155724', marginBottom: '10px' }}>
                  ✅ Salida Registrada y Pago Procesado: {ticketRecienPagado.codigo}
                </h4>
                <p style={{ marginBottom: '15px', color: '#155724' }}>
                  Descargue la factura como comprobante de pago.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => descargarFacturaPago(ticketRecienPagado.codigo)}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    🧾 Descargar Factura de Pago (PDF)
                  </button>
                  <button
                    onClick={cerrarModalSalida}
                    className="btn btn-secondary"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="card">
          <h3 className="card-title">Lista de Tickets ({tickets.length})</h3>
          {tickets.length === 0 ? (
            <p>No hay tickets registrados</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Placa</th>
                  <th>Tipo</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td><strong>{ticket.codigo}</strong></td>
                    <td>{ticket.placaVehiculo}</td>
                    <td><span className="badge badge-info">{ticket.tipoVehiculo}</span></td>
                    <td>{formatFecha(ticket.fechaHoraEntrada)}</td>
                    <td>{formatFecha(ticket.fechaHoraSalida)}</td>
                    <td><strong>{formatearCOP(ticket.montoTotal || 0)}</strong></td>
                    <td>
                      <span className={`badge ${getEstadoBadge(ticket.estado)}`}>
                        {ticket.estado}
                      </span>
                    </td>
                    <td>
                      {ticket.estado !== 'ACTIVO' && (
                        <button 
                          onClick={() => handleDescargarFactura(ticket.codigo)}
                          className="btn btn-primary btn-sm"
                          title="Descargar Factura PDF"
                        >
                          Factura PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {/* Componente de Paginación */}
          {tickets.length > 0 && (
            <Paginacion
              paginaActual={paginaInfo.page}
              totalPaginas={paginaInfo.totalPages}
              totalElementos={paginaInfo.totalElements}
              onCambiarPagina={handleCambiarPagina}
            />
          )}
        </div>
      </div>
      
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleSalida}
        title="Confirmar Salida"
        message={`¿Está seguro de registrar la salida? El monto a cobrar es ${tarifaCalculada ? formatearCOP(tarifaCalculada.montoTotal) : '$0'}. Esta acción no se puede deshacer.`}
        confirmText="Sí, Registrar Salida"
        cancelText="Cancelar"
        type="warning"
      />
    </div>
  );
};

export default Tickets;
