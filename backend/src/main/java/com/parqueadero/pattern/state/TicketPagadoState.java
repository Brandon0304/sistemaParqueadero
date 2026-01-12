package com.parqueadero.pattern.state;

import com.parqueadero.exception.BusinessException;
import com.parqueadero.model.Ticket;
import org.springframework.stereotype.Component;

@Component
public class TicketPagadoState implements TicketState {

    @Override
    public void procesarPago(Ticket ticket) {
        throw new BusinessException("El ticket ya ha sido pagado");
    }

    @Override
    public void cancelar(Ticket ticket) {
        throw new BusinessException("No se puede cancelar un ticket pagado");
    }

    @Override
    public String getEstadoActual() {
        return "PAGADO";
    }
}
