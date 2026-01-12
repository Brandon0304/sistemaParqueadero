import { useState, useEffect } from 'react';

/**
 * Hook para aplicar debouncing a un valor
 * Útil para evitar búsquedas excesivas mientras el usuario escribe
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
