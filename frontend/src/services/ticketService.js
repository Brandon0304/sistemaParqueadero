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

  listarConFiltros: async (filtros) => {
    const params = new URLSearchParams();
    
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    if (filtros.tipoVehiculo) params.append('tipoVehiculo', filtros.tipoVehiculo);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.placa) params.append('placa', filtros.placa);
    if (filtros.page !== undefined) params.append('page', filtros.page);
    if (filtros.size !== undefined) params.append('size', filtros.size);
    
    const response = await api.get(`/tickets/filtrar?${params.toString()}`);
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
  },

  exportarExcel: async (filtros) => {
    const params = new URLSearchParams();
    
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    if (filtros.tipoVehiculo) params.append('tipoVehiculo', filtros.tipoVehiculo);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.placa) params.append('placa', filtros.placa);
    
    const response = await api.get(`/reportes/tickets/excel?${params.toString()}`, {
      responseType: 'blob',
    });
    
    // Extraer nombre del archivo de los headers si está disponible
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'tickets_export.xlsx';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch) filename = filenameMatch[1];
    }
    
    // Crear enlace temporal para descargar
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportarPDF: async (filtros) => {
    const params = new URLSearchParams();
    
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    if (filtros.tipoVehiculo) params.append('tipoVehiculo', filtros.tipoVehiculo);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.placa) params.append('placa', filtros.placa);
    
    const response = await api.get(`/reportes/tickets/pdf?${params.toString()}`, {
      responseType: 'blob',
    });
    
    // Extraer nombre del archivo de los headers si está disponible
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'tickets_export.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch) filename = filenameMatch[1];
    }
    
    // Crear enlace temporal para descargar
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export default TicketService;
