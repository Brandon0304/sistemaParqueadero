package com.parqueadero.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {

    private Long id;
    private String codigo;
    private String placaVehiculo;
    private String tipoVehiculo;
    private LocalDateTime fechaHoraEntrada;
    private LocalDateTime fechaHoraSalida;
    private BigDecimal montoTotal;
    private String estado;
    private String observaciones;
    private String usuarioEntrada;
    private String usuarioSalida;
}
