import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TicketService from '../services/ticketService';
import VehiculoService from '../services/vehiculoService';
import QRScanner from './QRScanner';
import VehiculoAutocomplete from './VehiculoAutocomplete';
import ConfirmModal from './ConfirmModal';
import LoadingSpinner from './LoadingSpinner';
import { formatearCOP } from '../utils/moneda';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEntrada, setShowEntrada] = useState(false);
  const [showSalida, setShowSalida] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [vehiculoId, setVehiculoId] = useState('');
  const [busquedaPlaca, setBusquedaPlaca] = useState('');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [mostrarFormularioNuevo, setMostrarFormularioNuevo] = useState(false);
  const [nuevoVehiculo, setNuevoVehiculo] = useState({
    placa: '',
    tipo: 'AUTO',
    marca: '',
    modelo: '',
    color: ''
  });
  const [codigoSalida, setCodigoSalida] = useState('');
  const [tarifaCalculada, setTarifaCalculada] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [ticketsData, vehiculosData] = await Promise.all([
        TicketService.listarTodos(),
        VehiculoService.listarTodos()
      ]);
      setTickets(ticketsData);
      setVehiculos(vehiculosData);
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
      let payload;
      
      // Si hay un vehículo seleccionado del autocompletado
      if (vehiculoId) {
        payload = { vehiculoId: parseInt(vehiculoId) };
      } 
      // Si se está creando un vehículo nuevo inline
      else if (mostrarFormularioNuevo) {
        payload = {
          placa: nuevoVehiculo.placa,
          tipo: nuevoVehiculo.tipo,
          marca: nuevoVehiculo.marca,
          modelo: nuevoVehiculo.modelo,
          color: nuevoVehiculo.color
        };
      } else {
        toast.warning('Debe seleccionar un vehículo o crear uno nuevo');
        return;
      }
      
      await TicketService.registrarEntrada(payload);
      toast.success('✅ Entrada registrada exitosamente');
      setShowEntrada(false);
      setVehiculoId('');
      setBusquedaPlaca('');
      setVehiculoSeleccionado(null);
      setMostrarFormularioNuevo(false);
      setNuevoVehiculo({ placa: '', tipo: 'AUTO', marca: '', modelo: '', color: '' });
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
      await TicketService.registrarSalida(codigoSalida);
      toast.success('✅ Salida registrada y pago procesado');
      setShowSalida(false);
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
  
  const confirmarSalida = () => {
    if (!tarifaCalculada) {
      toast.warning('Debe calcular la tarifa antes de registrar la salida');
      return;
    }
    setShowConfirmModal(true);
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
      setSuccess(`Ticket ${codigo} escaneado correctamente`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Ticket no encontrado o no está activo');
      setTimeout(() => setError(''), 3000);
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
          <button onClick={() => setShowEntrada(!showEntrada)} className="btn btn-success">
            {showEntrada ? 'Cancelar' : 'Registrar Entrada'}
          </button>
          <button onClick={() => setShowSalida(!showSalida)} className="btn btn-danger">
            {showSalida ? 'Cancelar' : 'Registrar Salida'}
          </button>
        </div>
      </div>

      <div className="container">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {showEntrada && (
          <div className="card">
            <h3 className="card-title">Registrar Entrada</h3>
            <form onSubmit={handleEntrada}>
              <div className="form-group">
                <label>Buscar Vehículo por Placa *</label>
                <VehiculoAutocomplete
                  value={busquedaPlaca}
                  onChange={(valor) => {
                    setBusquedaPlaca(valor);
                    setMostrarFormularioNuevo(false);
                    if (!valor) {
                      setVehiculoSeleccionado(null);
                      setVehiculoId('');
                    }
                  }}
                  onSelect={(vehiculo) => {
                    setVehiculoSeleccionado(vehiculo);
                    setVehiculoId(vehiculo.id);
                    setBusquedaPlaca(vehiculo.placa);
                    setMostrarFormularioNuevo(false);
                  }}
                  placeholder="Escriba la placa del vehículo..."
                />
                {vehiculoSeleccionado && (
                  <div style={{
                    marginTop: '10px',
                    padding: '10px',
                    backgroundColor: '#e8f5e9',
                    borderRadius: '4px',
                    border: '1px solid #4caf50'
                  }}>
                    <strong>Vehículo seleccionado:</strong><br/>
                    {vehiculoSeleccionado.placa} - {vehiculoSeleccionado.tipo} - {vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo}
                  </div>
                )}
                
                {!vehiculoSeleccionado && busquedaPlaca.length >= 6 && (
                  <div style={{ marginTop: '10px' }}>
                    <button 
                      type="button"
                      onClick={() => {
                        setMostrarFormularioNuevo(true);
                        setNuevoVehiculo({ ...nuevoVehiculo, placa: busquedaPlaca });
                      }}
                      className="btn btn-secondary"
                      style={{ width: '100%' }}
                    >
                      + Crear Nuevo Vehículo con placa {busquedaPlaca}
                    </button>
                  </div>
                )}
              </div>

              {mostrarFormularioNuevo && (
                <div style={{
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                  marginBottom: '15px'
                }}>
                  <h4 style={{ marginBottom: '15px', color: '#2C3E50' }}>Datos del Nuevo Vehículo</h4>
                  
                  <div className="form-group">
                    <label>Placa *</label>
                    <input
                      type="text"
                      value={nuevoVehiculo.placa}
                      onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, placa: e.target.value.toUpperCase() })}
                      required
                      style={{ backgroundColor: '#e9ecef' }}
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label>Tipo de Vehículo *</label>
                    <select
                      value={nuevoVehiculo.tipo}
                      onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, tipo: e.target.value })}
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
                      value={nuevoVehiculo.marca}
                      onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, marca: e.target.value })}
                      placeholder="Ej: Toyota, Honda, Yamaha..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Modelo</label>
                    <input
                      type="text"
                      value={nuevoVehiculo.modelo}
                      onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, modelo: e.target.value })}
                      placeholder="Ej: Corolla, Civic, R6..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Color</label>
                    <input
                      type="text"
                      value={nuevoVehiculo.color}
                      onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, color: e.target.value })}
                      placeholder="Ej: Rojo, Azul, Negro..."
                    />
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      setMostrarFormularioNuevo(false);
                      setNuevoVehiculo({ placa: '', tipo: 'AUTO', marca: '', modelo: '', color: '' });
                    }}
                    className="btn btn-secondary"
                    style={{ marginTop: '10px' }}
                  >
                    Cancelar Nuevo Vehículo
                  </button>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-success" 
                disabled={!vehiculoId && !mostrarFormularioNuevo}
              >
                Registrar Entrada
              </button>
            </form>
          </div>
        )}

        {showSalida && (
          <div className="card">
            <h3 className="card-title">Registrar Salida</h3>
            
            <QRScanner 
              onScan={handleQRScan}
              onError={(err) => setError('Error al escanear QR')}
            />

            <button onClick={calcularTarifa} className="btn btn-primary" disabled={!codigoSalida}>
              Calcular Tarifa
            </button>

            {tarifaCalculada && (
              <div className="alert alert-info" style={{ marginTop: '20px' }}>
                <h4>Tarifa Calculada</h4>
                <p><strong>Monto Total:</strong> {formatearCOP(tarifaCalculada.montoTotal)}</p>
                <p><strong>Tiempo:</strong> {tarifaCalculada.detalleCalculo}</p>
                <p><strong>Tipo:</strong> {tarifaCalculada.tipoVehiculo}</p>
                <button onClick={confirmarSalida} className="btn btn-success" style={{ marginTop: '10px' }}>
                  Confirmar Salida y Pagar
                </button>
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
