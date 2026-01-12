package com.parqueadero.pattern.state;

import com.parqueadero.model.Ticket;

/**
 * Patrón State para el manejo de estados del ticket
 */
public interface TicketState {
    
    void procesarPago(Ticket ticket);
    
    void cancelar(Ticket ticket);
    
    String getEstadoActual();
}
