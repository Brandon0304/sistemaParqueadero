import React from 'react';

const FiltrosTickets = ({ filtros, onFiltrosChange, onBuscar, onLimpiar }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFiltrosChange({ ...filtros, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onBuscar();
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h3 className="card-title">🔍 Filtros de Búsqueda</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          
          {/* Filtro por Fecha Desde */}
          <div className="form-group">
            <label htmlFor="fechaDesde">Fecha Desde</label>
            <input
              id="fechaDesde"
              type="datetime-local"
              name="fechaDesde"
              value={filtros.fechaDesde || ''}
              onChange={handleChange}
            />
          </div>

          {/* Filtro por Fecha Hasta */}
          <div className="form-group">
            <label htmlFor="fechaHasta">Fecha Hasta</label>
            <input
              id="fechaHasta"
              type="datetime-local"
              name="fechaHasta"
              value={filtros.fechaHasta || ''}
              onChange={handleChange}
            />
          </div>

          {/* Filtro por Tipo de Vehículo */}
          <div className="form-group">
            <label htmlFor="tipoVehiculo">Tipo de Vehículo</label>
            <select
              id="tipoVehiculo"
              name="tipoVehiculo"
              value={filtros.tipoVehiculo || ''}
              onChange={handleChange}
            >
              <option value="">Todos</option>
              <option value="AUTO">🚗 Auto</option>
              <option value="MOTO">🏍️ Moto</option>
              <option value="BICICLETA">🚲 Bicicleta</option>
              <option value="CAMION">🚚 Camión</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="form-group">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              name="estado"
              value={filtros.estado || ''}
              onChange={handleChange}
            >
              <option value="">Todos</option>
              <option value="ACTIVO">Activo</option>
              <option value="PAGADO">Pagado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          {/* Filtro por Placa */}
          <div className="form-group">
            <label htmlFor="placa">Placa</label>
            <input
              id="placa"
              type="text"
              name="placa"
              value={filtros.placa || ''}
              onChange={handleChange}
              placeholder="Buscar placa..."
            />
          </div>
        </div>

        {/* Botones de Acción */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary">
            🔍 Buscar
          </button>
          <button type="button" onClick={onLimpiar} className="btn btn-secondary">
            🔄 Limpiar Filtros
          </button>
        </div>
      </form>
    </div>
  );
};

export default FiltrosTickets;
