package com.parqueadero.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalculoTarifaResponse {

    private BigDecimal montoTotal;
    private Long minutosTranscurridos;
    private Long horasTranscurridas;
    private String tipoVehiculo;
    private String detalleCalculo;
}
