import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VehiculoService from '../services/vehiculoService';

const Vehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    placa: '',
    tipo: 'AUTO',
    marca: '',
    modelo: '',
    color: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    try {
      const data = await VehiculoService.listarTodos();
      setVehiculos(data);
    } catch (err) {
      setError('Error al cargar los vehículos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await VehiculoService.registrar(formData);
      setShowForm(false);
      setFormData({ placa: '', tipo: 'AUTO', marca: '', modelo: '', color: '' });
      cargarVehiculos();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el vehículo');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div>
      <div className="header">
        <h1>Gestión de Vehículos</h1>
        <div className="nav">
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            Volver
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-success">
            {showForm ? 'Cancelar' : 'Nuevo Vehículo'}
          </button>
        </div>
      </div>

      <div className="container">
        {error && <div className="alert alert-error">{error}</div>}

        {showForm && (
          <div className="card">
            <h3 className="card-title">Registrar Nuevo Vehículo</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Placa *</label>
                <input
                  type="text"
                  name="placa"
                  value={formData.placa}
                  onChange={handleChange}
                  required
                  placeholder="ABC123"
                />
              </div>

              <div className="form-group">
                <label>Tipo *</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange} required>
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
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  placeholder="Toyota"
                />
              </div>

              <div className="form-group">
                <label>Modelo</label>
                <input
                  type="text"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  placeholder="Corolla"
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="Blanco"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Registrar Vehículo
              </button>
            </form>
          </div>
        )}

        <div className="card">
          <h3 className="card-title">Lista de Vehículos ({vehiculos.length})</h3>
          {vehiculos.length === 0 ? (
            <p>No hay vehículos registrados</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Tipo</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Color</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.map((vehiculo) => (
                  <tr key={vehiculo.id}>
                    <td><strong>{vehiculo.placa}</strong></td>
                    <td><span className="badge badge-info">{vehiculo.tipo}</span></td>
                    <td>{vehiculo.marca || '-'}</td>
                    <td>{vehiculo.modelo || '-'}</td>
                    <td>{vehiculo.color || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vehiculos;
