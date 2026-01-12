import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import axios from 'axios';

const VehiculoAutocomplete = ({ onSelect, value, onChange, placeholder = "Buscar por placa..." }) => {
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [cargando, setCargando] = useState(false);
  const wrapperRef = useRef(null);
  
  const debouncedQuery = useDebounce(value, 300);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMostrarSugerencias(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar vehículos cuando cambia el query
  useEffect(() => {
    const buscarVehiculos = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSugerencias([]);
        setMostrarSugerencias(false);
        return;
      }

      setCargando(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/vehiculos/search?q=${debouncedQuery}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSugerencias(response.data);
        setMostrarSugerencias(response.data.length > 0);
      } catch (error) {
        console.error('Error al buscar vehículos:', error);
        setSugerencias([]);
      } finally {
        setCargando(false);
      }
    };

    buscarVehiculos();
  }, [debouncedQuery]);

  const handleSelect = (vehiculo) => {
    onSelect(vehiculo);
    setMostrarSugerencias(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px'
        }}
      />
      
      {cargando && (
        <div style={{
          position: 'absolute',
          right: '10px',
          top: '12px',
          fontSize: '12px',
          color: '#666'
        }}>
          Buscando...
        </div>
      )}

      {mostrarSugerencias && sugerencias.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
          maxHeight: '200px',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          {sugerencias.map((vehiculo) => (
            <div
              key={vehiculo.id}
              onClick={() => handleSelect(vehiculo)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <div style={{ fontWeight: 'bold', color: '#2C3E50' }}>
                {vehiculo.placa}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {vehiculo.tipo} - {vehiculo.marca} {vehiculo.modelo}
                {vehiculo.color && ` (${vehiculo.color})`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehiculoAutocomplete;
