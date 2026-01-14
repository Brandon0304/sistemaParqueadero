import api from './api';

const EstadisticasService = {
    async obtenerOcupacionPorHora() {
        const response = await api.get('/estadisticas/ocupacion-por-hora');
        return response.data;
    },

    async obtenerIngresosDiarios() {
        const response = await api.get('/estadisticas/ingresos-diarios');
        return response.data;
    },

    async obtenerDistribucionVehiculos() {
        const response = await api.get('/estadisticas/distribucion-vehiculos');
        return response.data;
    },

    async obtenerTiempoPromedio() {
        const response = await api.get('/estadisticas/tiempo-promedio');
        return response.data;
    },

    async obtenerResumenHoy() {
        const response = await api.get('/estadisticas/resumen-hoy');
        return response.data;
    }
};

export default EstadisticasService;
