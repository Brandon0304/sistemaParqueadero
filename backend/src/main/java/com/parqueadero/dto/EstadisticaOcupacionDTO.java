package com.parqueadero.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticaOcupacionDTO {
    private String hora;
    private Long ocupados;
    private Integer capacidadTotal;
    private Double porcentajeOcupacion;
}
