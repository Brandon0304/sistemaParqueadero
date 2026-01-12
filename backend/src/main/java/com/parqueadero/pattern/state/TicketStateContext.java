package com.parqueadero.pattern.state;

import com.parqueadero.model.Ticket;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Context del patrón State
 */
@Component
public class TicketStateContext {

    private final Map<Ticket.EstadoTicket, TicketState> states = new HashMap<>();

    @Autowired
    public TicketStateContext(TicketActivoState activoState,
                              TicketPagadoState pagadoState,
                              TicketCanceladoState canceladoState) {
        states.put(Ticket.EstadoTicket.ACTIVO, activoState);
        states.put(Ticket.EstadoTicket.PAGADO, pagadoState);
        states.put(Ticket.EstadoTicket.CANCELADO, canceladoState);
    }

    public TicketState getState(Ticket.EstadoTicket estado) {
        return states.get(estado);
    }

    public void procesarPago(Ticket ticket) {
        TicketState state = getState(ticket.getEstado());
        state.procesarPago(ticket);
    }

    public void cancelar(Ticket ticket) {
        TicketState state = getState(ticket.getEstado());
        state.cancelar(ticket);
    }
}
