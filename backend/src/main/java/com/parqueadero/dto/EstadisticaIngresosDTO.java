package com.parqueadero.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticaIngresosDTO {
    private String fecha;
    private Long totalTickets;
    private Double totalIngresos;
}
