package com.parqueadero.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumenHoyDTO {
    private Long vehiculosActivos;
    private Long vehiculosSalidos;
    private Double ingresosHoy;
    private Double tiempoPromedioMinutos;
    private Integer espaciosDisponibles;
    private Integer capacidadTotal;
}
