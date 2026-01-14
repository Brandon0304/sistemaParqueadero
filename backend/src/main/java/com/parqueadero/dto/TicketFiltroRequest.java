package com.parqueadero.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class TicketFiltroRequest {
    private LocalDateTime fechaDesde;
    private LocalDateTime fechaHasta;
    private String tipoVehiculo;
    private String estado;
    private String placa;
    private Integer page = 0;
    private Integer size = 20;
}
