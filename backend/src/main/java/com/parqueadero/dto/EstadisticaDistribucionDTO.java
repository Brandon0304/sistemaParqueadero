package com.parqueadero.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticaDistribucionDTO {
    private String tipoVehiculo;
    private Long cantidad;
    private Double porcentaje;
}
