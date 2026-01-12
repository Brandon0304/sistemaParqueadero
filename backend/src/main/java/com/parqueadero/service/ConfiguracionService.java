package com.parqueadero.service;

import com.parqueadero.dto.EspaciosResponse;
import com.parqueadero.dto.EspaciosResponse.EspacioDetalle;
import com.parqueadero.model.Configuracion;
import com.parqueadero.model.Ticket;
import com.parqueadero.model.Vehiculo;
import com.parqueadero.repository.ConfiguracionRepository;
import com.parqueadero.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ConfiguracionService {

    @Autowired
    private ConfiguracionRepository configuracionRepository;

    @Autowired
    private TicketRepository ticketRepository;

    public EspaciosResponse obtenerEspaciosDisponibles() {
        List<Configuracion> configuraciones = configuracionRepository.findByActivaTrue();
        Map<String, EspacioDetalle> espacios = new HashMap<>();

        for (Configuracion config : configuraciones) {
            // Contar tickets activos para este tipo de vehículo
            long ocupados = ticketRepository.countByVehiculoTipoAndEstado(
                    config.getTipoVehiculo(),
                    Ticket.EstadoTicket.ACTIVO
            );

            int disponibles = Math.max(0, config.getCapacidadTotal() - (int) ocupados);
            double porcentaje = config.getCapacidadTotal() > 0
                    ? (ocupados * 100.0) / config.getCapacidadTotal()
                    : 0;

            EspacioDetalle detalle = new EspacioDetalle(
                    config.getCapacidadTotal(),
                    (int) ocupados,
                    disponibles,
                    Math.round(porcentaje * 100.0) / 100.0 // Redondear a 2 decimales
            );

            espacios.put(config.getTipoVehiculo().name(), detalle);
        }

        return new EspaciosResponse(espacios);
    }

    public boolean hayEspacioDisponible(Vehiculo.TipoVehiculo tipoVehiculo) {
        return configuracionRepository.findByTipoVehiculo(tipoVehiculo)
                .map(config -> {
                    long ocupados = ticketRepository.countByVehiculoTipoAndEstado(
                            tipoVehiculo,
                            Ticket.EstadoTicket.ACTIVO
                    );
                    return ocupados < config.getCapacidadTotal();
                })
                .orElse(true); // Si no hay configuración, permitir entrada
    }
}
