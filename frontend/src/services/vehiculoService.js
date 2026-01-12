import api from './api';

const VehiculoService = {
  registrar: async (vehiculo) => {
    const response = await api.post('/vehiculos', vehiculo);
    return response.data;
  },

  obtenerPorId: async (id) => {
    const response = await api.get(`/vehiculos/${id}`);
    return response.data;
  },

  obtenerPorPlaca: async (placa) => {
    const response = await api.get(`/vehiculos/placa/${placa}`);
    return response.data;
  },

  listarTodos: async () => {
    const response = await api.get('/vehiculos');
    return response.data;
  },

  actualizar: async (id, vehiculo) => {
    const response = await api.put(`/vehiculos/${id}`, vehiculo);
    return response.data;
  },

  eliminar: async (id) => {
    const response = await api.delete(`/vehiculos/${id}`);
    return response.data;
  }
};

export default VehiculoService;
