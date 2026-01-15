import api from './api';

const AlertasService = {
    async obtenerEspaciosCriticos() {
        const response = await api.get('/alertas/espacios-criticos');
        return response.data;
    },

    async obtenerContador() {
        const response = await api.get('/alertas/contador');
        return response.data;
    }
};

export default AlertasService;
