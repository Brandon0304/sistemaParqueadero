/**
 * Utilidades para formatear valores monetarios en COP (Peso Colombiano)
 */

/**
 * Formatea un número a formato de moneda colombiana
 * @param {number} monto - El monto a formatear
 * @returns {string} - Monto formateado (ej: "$5.000")
 */
export const formatearCOP = (monto) => {
  if (monto === null || monto === undefined) {
    return '$0';
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto);
};

/**
 * Retorna el símbolo de moneda
 */
export const simboloMoneda = '$';

/**
 * Retorna el código ISO de la moneda
 */
export const codigoMoneda = 'COP';
