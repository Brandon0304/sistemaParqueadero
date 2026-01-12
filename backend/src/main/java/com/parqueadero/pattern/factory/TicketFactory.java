package com.parqueadero.pattern.factory;

import com.parqueadero.model.Ticket;
import com.parqueadero.model.Usuario;
import com.parqueadero.model.Vehiculo;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Patrón Factory para la creación de Tickets
 */
@Component
public class TicketFactory {

    public Ticket crearTicketEntrada(Vehiculo vehiculo, Usuario usuario, String observaciones) {
        Ticket ticket = new Ticket();
        ticket.setCodigo(generarCodigo());
        ticket.setVehiculo(vehiculo);
        ticket.setUsuarioEntrada(usuario);
        ticket.setFechaHoraEntrada(LocalDateTime.now());
        ticket.setEstado(Ticket.EstadoTicket.ACTIVO);
        ticket.setObservaciones(observaciones);
        return ticket;
    }

    private String generarCodigo() {
        return "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
