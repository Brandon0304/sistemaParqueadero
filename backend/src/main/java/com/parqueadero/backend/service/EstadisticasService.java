package com.parqueadero.backend.service;

import com.parqueadero.backend.dto.*;
import com.parqueadero.model.Ticket;
import com.parqueadero.repository.ConfiguracionRepository;
import com.parqueadero.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EstadisticasService {

    private final TicketRepository ticketRepository;
    private final ConfiguracionRepository configuracionRepository;

    /**
     * Ocupación por hora del día actual (últimas 24 horas)
     */
    public List<EstadisticaOcupacionDTO> obtenerOcupacionPorHora() {
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime hace24h = ahora.minusHours(24);
        
        List<EstadisticaOcupacionDTO> resultado = new ArrayList<>();
        
        // Capacidad total (suma de todas las configuraciones)
        int capacidadTotal = configuracionRepository.findAll().stream()
                .mapToInt(c -> c.getCapacidadTotal())
                .sum();
        
        // Generar estadística para cada hora
        for (int i = 0; i < 24; i++) {
            LocalDateTime horaInicio = hace24h.plusHours(i);
            LocalDateTime horaFin = horaInicio.plusHours(1);
            
            // Contar tickets activos en ese momento (entrada antes del fin, salida después del inicio o null)
            long ocupados = ticketRepository.findAll().stream()
                    .filter(t -> 
                        t.getFechaHoraEntrada().isBefore(horaFin) &&
                        (t.getFechaHoraSalida() == null || t.getFechaHoraSalida().isAfter(horaInicio))
                    )
                    .count();
            
            double porcentaje = capacidadTotal > 0 ? (ocupados * 100.0 / capacidadTotal) : 0;
            
            String horaLabel = horaInicio.format(DateTimeFormatter.ofPattern("HH:mm"));
            resultado.add(new EstadisticaOcupacionDTO(horaLabel, ocupados, capacidadTotal, 
                    Math.round(porcentaje * 100.0) / 100.0));
        }
        
        return resultado;
    }

    /**
     * Ingresos diarios de los últimos 7 días
     */
    public List<EstadisticaIngresosDTO> obtenerIngresosDiarios() {
        LocalDate hoy = LocalDate.now();
        List<EstadisticaIngresosDTO> resultado = new ArrayList<>();
        
        for (int i = 6; i >= 0; i--) {
            LocalDate fecha = hoy.minusDays(i);
            LocalDateTime inicioDelDia = fecha.atStartOfDay();
            LocalDateTime finDelDia = fecha.atTime(LocalTime.MAX);
            
            List<Ticket> ticketsDelDia = ticketRepository.findByFechaHoraEntradaBetween(inicioDelDia, finDelDia);
            
            long totalTickets = ticketsDelDia.stream()
                    .filter(t -> t.getEstado() == Ticket.EstadoTicket.PAGADO)
                    .count();
            
            double totalIngresos = ticketsDelDia.stream()
                    .filter(t -> t.getEstado() == Ticket.EstadoTicket.PAGADO)
                    .mapToDouble(t -> t.getMontoTotal() != null ? t.getMontoTotal().doubleValue() : 0.0)
                    .sum();
            
            String fechaLabel = fecha.format(DateTimeFormatter.ofPattern("dd/MM"));
            resultado.add(new EstadisticaIngresosDTO(fechaLabel, totalTickets, 
                    Math.round(totalIngresos * 100.0) / 100.0));
        }
        
        return resultado;
    }

    /**
     * Distribución de vehículos por tipo (activos actualmente)
     */
    public List<EstadisticaDistribucionDTO> obtenerDistribucionVehiculos() {
        List<Ticket> ticketsActivos = ticketRepository.findByEstado(Ticket.EstadoTicket.ACTIVO);
        
        long total = ticketsActivos.size();
        
        Map<String, Long> distribucion = ticketsActivos.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getVehiculo().getTipo().name(),
                        Collectors.counting()
                ));
        
        return distribucion.entrySet().stream()
                .map(entry -> {
                    double porcentaje = total > 0 ? (entry.getValue() * 100.0 / total) : 0;
                    return new EstadisticaDistribucionDTO(
                            entry.getKey(),
                            entry.getValue(),
                            Math.round(porcentaje * 100.0) / 100.0
                    );
                })
                .collect(Collectors.toList());
    }

    /**
     * Tiempo promedio de estadía (en minutos) del día actual
     */
    public Double obtenerTiempoPromedioEstadia() {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime finDia = LocalDate.now().atTime(LocalTime.MAX);
        
        List<Ticket> ticketsSalidosHoy = ticketRepository.findByFechaHoraEntradaBetween(inicioDia, finDia)
                .stream()
                .filter(t -> t.getFechaHoraSalida() != null)
                .collect(Collectors.toList());
        
        if (ticketsSalidosHoy.isEmpty()) {
            return 0.0;
        }
        
        double promedioMinutos = ticketsSalidosHoy.stream()
                .mapToLong(t -> ChronoUnit.MINUTES.between(t.getFechaHoraEntrada(), t.getFechaHoraSalida()))
                .average()
                .orElse(0.0);
        
        return Math.round(promedioMinutos * 100.0) / 100.0;
    }

    /**
     * Resumen completo del día actual
     */
    public ResumenHoyDTO obtenerResumenHoy() {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime finDia = LocalDate.now().atTime(LocalTime.MAX);
        
        // Vehículos activos ahora
        long vehiculosActivos = ticketRepository.countByEstado(Ticket.EstadoTicket.ACTIVO);
        
        // Vehículos que salieron hoy
        long vehiculosSalidos = ticketRepository.findByFechaHoraEntradaBetween(inicioDia, finDia)
                .stream()
                .filter(t -> t.getEstado() == Ticket.EstadoTicket.PAGADO)
                .count();
        
        // Ingresos de hoy
        double ingresosHoy = ticketRepository.findByFechaHoraEntradaBetween(inicioDia, finDia)
                .stream()
                .filter(t -> t.getEstado() == Ticket.EstadoTicket.PAGADO)
                .mapToDouble(t -> t.getMontoTotal() != null ? t.getMontoTotal().doubleValue() : 0.0)
                .sum();
        
        // Tiempo promedio
        double tiempoPromedio = obtenerTiempoPromedioEstadia();
        
        // Capacidad y espacios disponibles
        int capacidadTotal = configuracionRepository.findAll().stream()
                .mapToInt(c -> c.getCapacidadTotal())
                .sum();
        
        int espaciosDisponibles = capacidadTotal - (int) vehiculosActivos;
        
        return new ResumenHoyDTO(
                vehiculosActivos,
                vehiculosSalidos,
                Math.round(ingresosHoy * 100.0) / 100.0,
                tiempoPromedio,
                espaciosDisponibles,
                capacidadTotal
        );
    }
}
