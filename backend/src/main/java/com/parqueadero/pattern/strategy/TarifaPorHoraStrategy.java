package com.parqueadero.pattern.strategy;

import com.parqueadero.model.Tarifa;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;

@Component
public class TarifaPorHoraStrategy implements TarifaStrategy {

    @Override
    public BigDecimal calcularTarifa(LocalDateTime entrada, LocalDateTime salida, Tarifa tarifa) {
        Duration duracion = Duration.between(entrada, salida);
        long minutos = duracion.toMinutes();
        
        if (minutos <= 0) {
            return BigDecimal.ZERO;
        }
        
        // Calcular días completos
        long dias = minutos / (24 * 60);
        long minutosRestantes = minutos % (24 * 60);
        
        BigDecimal total = BigDecimal.ZERO;
        
        // Cobrar días completos
        if (dias > 0) {
            total = tarifa.getTarifaDia().multiply(BigDecimal.valueOf(dias));
        }
        
        // Calcular horas completas del resto
        long horas = minutosRestantes / 60;
        long minutosFinales = minutosRestantes % 60;
        
        // Cobrar horas completas
        if (horas > 0) {
            total = total.add(tarifa.getTarifaHora().multiply(BigDecimal.valueOf(horas)));
        }
        
        // Cobrar minutos adicionales
        if (minutosFinales > 0) {
            total = total.add(tarifa.getTarifaMinutoAdicional().multiply(BigDecimal.valueOf(minutosFinales)));
        }
        
        return total.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public String getDetalleCalculo(LocalDateTime entrada, LocalDateTime salida, Tarifa tarifa) {
        Duration duracion = Duration.between(entrada, salida);
        long minutos = duracion.toMinutes();
        
        long dias = minutos / (24 * 60);
        long minutosRestantes = minutos % (24 * 60);
        long horas = minutosRestantes / 60;
        long minutosFinales = minutosRestantes % 60;
        
        StringBuilder detalle = new StringBuilder();
        detalle.append("Tiempo total: ");
        
        if (dias > 0) {
            detalle.append(dias).append(" día(s) ");
        }
        if (horas > 0) {
            detalle.append(horas).append(" hora(s) ");
        }
        if (minutosFinales > 0) {
            detalle.append(minutosFinales).append(" minuto(s)");
        }
        
        return detalle.toString();
    }
}
