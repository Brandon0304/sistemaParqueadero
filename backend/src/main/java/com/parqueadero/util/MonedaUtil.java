package com.parqueadero.util;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

public class MonedaUtil {

    private static final Locale LOCALE_COLOMBIA = Locale.forLanguageTag("es-CO");
    private static final NumberFormat FORMATO_COP = NumberFormat.getCurrencyInstance(LOCALE_COLOMBIA);

    /**
     * Formatea un BigDecimal a formato de moneda colombiana (COP)
     * Ejemplo: 5000 -> $5.000
     */
    public static String formatearCOP(BigDecimal monto) {
        if (monto == null) {
            return "$0";
        }
        return FORMATO_COP.format(monto);
    }

    /**
     * Formatea un double a formato de moneda colombiana (COP)
     */
    public static String formatearCOP(double monto) {
        return formatearCOP(BigDecimal.valueOf(monto));
    }

    /**
     * Retorna el símbolo de la moneda
     */
    public static String getSimboloMoneda() {
        return "$";
    }

    /**
     * Retorna el código ISO de la moneda
     */
    public static String getCodigoMoneda() {
        return "COP";
    }
}
