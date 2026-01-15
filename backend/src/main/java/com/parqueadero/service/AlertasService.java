package com.parqueadero.service;

import com.parqueadero.dto.AlertaDTO;
import com.parqueadero.model.Configuracion;
import com.parqueadero.model.Ticket;
import com.parqueadero.model.Vehiculo;
import com.parqueadero.repository.ConfiguracionRepository;
import com.parqueadero.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertasService {

    private final TicketRepository ticketRepository;
    private final ConfiguracionRepository configuracionRepository;

    /**
     * Obtiene alertas de espacios críticos
     * CRITICO: >= 90% ocupación
     * ADVERTENCIA: >= 80% ocupación
     */
    public List<AlertaDTO> obtenerEspaciosCriticos() {
        List<AlertaDTO> alertas = new ArrayList<>();

        // Obtener tickets activos
        List<Ticket> ticketsActivos = ticketRepository.findByEstado(Ticket.EstadoTicket.ACTIVO);

        // Contar por tipo de vehículo
        Map<Vehiculo.TipoVehiculo, Long> ocupadosPorTipo = ticketsActivos.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getVehiculo().getTipo(),
                        Collectors.counting()
                ));

        // Obtener configuraciones
        List<Configuracion> configuraciones = configuracionRepository.findAll();

        // Generar alertas por cada tipo
        for (Configuracion config : configuraciones) {
            long ocupados = ocupadosPorTipo.getOrDefault(config.getTipoVehiculo(), 0L);
            int capacidad = config.getCapacidadTotal();
            double porcentaje = capacidad > 0 ? (ocupados * 100.0 / capacidad) : 0;

            if (porcentaje >= 90) {
                alertas.add(new AlertaDTO(
                        "CRITICO",
                        config.getTipoVehiculo().name(),
                        (int) ocupados,
                        capacidad,
                        Math.round(porcentaje * 100.0) / 100.0,
                        "🔴 CRÍTICO: " + config.getTipoVehiculo().name() + 
                        " casi lleno (" + String.format("%.0f", porcentaje) + "%)"
                ));
            } else if (porcentaje >= 80) {
                alertas.add(new AlertaDTO(
                        "ADVERTENCIA",
                        config.getTipoVehiculo().name(),
                        (int) ocupados,
                        capacidad,
                        Math.round(porcentaje * 100.0) / 100.0,
                        "⚠️ ADVERTENCIA: " + config.getTipoVehiculo().name() + 
                        " con alta ocupación (" + String.format("%.0f", porcentaje) + "%)"
                ));
            }
        }

        return alertas;
    }

    /**
     * Cuenta el número de alertas críticas y de advertencia
     */
    public Map<String, Integer> contarAlertas() {
        List<AlertaDTO> alertas = obtenerEspaciosCriticos();
        
        long criticas = alertas.stream().filter(a -> "CRITICO".equals(a.getTipo())).count();
        long advertencias = alertas.stream().filter(a -> "ADVERTENCIA".equals(a.getTipo())).count();
        
        return Map.of(
                "criticas", (int) criticas,
                "advertencias", (int) advertencias,
                "total", alertas.size()
        );
    }
}
