package com.parqueadero.pattern.state;

import com.parqueadero.exception.BusinessException;
import com.parqueadero.model.Ticket;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class TicketActivoState implements TicketState {

    @Override
    public void procesarPago(Ticket ticket) {
        ticket.setEstado(Ticket.EstadoTicket.PAGADO);
        ticket.setFechaHoraSalida(LocalDateTime.now());
    }

    @Override
    public void cancelar(Ticket ticket) {
        ticket.setEstado(Ticket.EstadoTicket.CANCELADO);
    }

    @Override
    public String getEstadoActual() {
        return "ACTIVO";
    }
}
