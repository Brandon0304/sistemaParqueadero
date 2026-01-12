package com.parqueadero.pattern.state;

import com.parqueadero.exception.BusinessException;
import com.parqueadero.model.Ticket;
import org.springframework.stereotype.Component;

@Component
public class TicketCanceladoState implements TicketState {

    @Override
    public void procesarPago(Ticket ticket) {
        throw new BusinessException("No se puede procesar el pago de un ticket cancelado");
    }

    @Override
    public void cancelar(Ticket ticket) {
        throw new BusinessException("El ticket ya está cancelado");
    }

    @Override
    public String getEstadoActual() {
        return "CANCELADO";
    }
}
