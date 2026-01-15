package com.parqueadero.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertaDTO {
    private String tipo; // "CRITICO", "ADVERTENCIA", "INFO"
    private String tipoVehiculo;
    private Integer ocupados;
    private Integer capacidadTotal;
    private Double porcentajeOcupacion;
    private String mensaje;
}
