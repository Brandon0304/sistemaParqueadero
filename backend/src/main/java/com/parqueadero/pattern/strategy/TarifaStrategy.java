package com.parqueadero.pattern.strategy;

import com.parqueadero.model.Tarifa;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Patrón Strategy para el cálculo de tarifas
 */
public interface TarifaStrategy {
    
    BigDecimal calcularTarifa(LocalDateTime entrada, LocalDateTime salida, Tarifa tarifa);
    
    String getDetalleCalculo(LocalDateTime entrada, LocalDateTime salida, Tarifa tarifa);
}
