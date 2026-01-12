import api from './api';

const configuracionService = {
  obtenerEspaciosDisponibles: async () => {
    try {
      const response = await api.get('/configuracion/espacios');
      return response.data;
    } catch (error) {
      console.error('Error al obtener espacios disponibles:', error);
      throw error;
    }
  },
};

export default configuracionService;
