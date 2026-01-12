package com.parqueadero.util;

import com.parqueadero.exception.BusinessException;

import java.util.regex.Pattern;

public class PlacaUtil {

    // Patrones para placas colombianas
    private static final Pattern PLACA_VEHICULO = Pattern.compile("^[A-Z]{3}[0-9]{3}$"); // ABC123
    private static final Pattern PLACA_MOTO = Pattern.compile("^[A-Z]{3}[0-9]{2}[A-Z]$"); // ABC12D
    private static final Pattern PLACA_DIPLOMATICA = Pattern.compile("^[0-9]{3}[A-Z]{3}$"); // 123ABC

    /**
     * Normaliza una placa:
     * - Convierte a mayúsculas
     * - Elimina espacios, guiones y caracteres especiales
     * - Valida el formato
     */
    public static String normalizar(String placa) {
        if (placa == null || placa.trim().isEmpty()) {
            throw new BusinessException("La placa no puede estar vacía");
        }

        // Convertir a mayúsculas y quitar espacios/guiones/puntos
        String placaNormalizada = placa.toUpperCase()
                .replaceAll("[\\s\\-\\._]", "");

        // Validar longitud
        if (placaNormalizada.length() < 6 || placaNormalizada.length() > 6) {
            throw new BusinessException("La placa debe tener 6 caracteres. Formato: ABC123 o ABC12D");
        }

        // Validar formato
        if (!esPlacaValida(placaNormalizada)) {
            throw new BusinessException(
                "Formato de placa inválido. Formatos válidos: " +
                "ABC123 (vehículos), ABC12D (motos), 123ABC (diplomático)"
            );
        }

        return placaNormalizada;
    }

    /**
     * Valida si una placa tiene un formato válido colombiano
     */
    public static boolean esPlacaValida(String placa) {
        if (placa == null || placa.isEmpty()) {
            return false;
        }

        return PLACA_VEHICULO.matcher(placa).matches() ||
               PLACA_MOTO.matcher(placa).matches() ||
               PLACA_DIPLOMATICA.matcher(placa).matches();
    }

    /**
     * Formatea una placa para mostrar (añade guión)
     * ABC123 -> ABC-123
     */
    public static String formatear(String placa) {
        if (placa == null || placa.length() != 6) {
            return placa;
        }

        return placa.substring(0, 3) + "-" + placa.substring(3);
    }
}
