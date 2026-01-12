import api from './api';

const TicketService = {
  registrarEntrada: async (ticketData) => {
    const response = await api.post('/tickets/entrada', ticketData);
    return response.data;
  },

  registrarSalida: async (codigo) => {
    const response = await api.post(`/tickets/salida/${codigo}`);
    return response.data;
  },

  obtenerPorCodigo: async (codigo) => {
    const response = await api.get(`/tickets/${codigo}`);
    return response.data;
  },

  listarTodos: async () => {
    const response = await api.get('/tickets');
    return response.data;
  },

  listarActivos: async () => {
    const response = await api.get('/tickets/activos');
    return response.data;
  },

  calcularTarifa: async (codigo) => {
    const response = await api.get(`/tickets/calcular/${codigo}`);
    return response.data;
  },

  cancelar: async (codigo) => {
    const response = await api.delete(`/tickets/cancelar/${codigo}`);
    return response.data;
  },

  descargarFactura: async (codigo) => {
    const response = await api.get(`/tickets/${codigo}/factura`, {
      responseType: 'blob',
    });
    
    // Crear un enlace temporal para descargar el PDF
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `factura-${codigo}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export default TicketService;
