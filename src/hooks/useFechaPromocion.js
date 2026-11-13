import { useEffect, useState } from 'react';
import { fechaColombia } from '../utils/promociones';

// Actualiza al cambiar el día en Colombia, aunque la página permanezca abierta.
export default function useFechaPromocion() {
  const [hoy, setHoy] = useState(fechaColombia);
  useEffect(() => {
    let timer;
    const actualizar = () => {
      clearTimeout(timer);
      const fecha = fechaColombia();
      setHoy(fecha);
      const siguienteMedianoche = Date.parse(`${fecha}T05:00:00Z`) + 86400000;
      timer = setTimeout(actualizar, Math.max(100, siguienteMedianoche - Date.now() + 50));
    };
    actualizar();
    window.addEventListener('focus', actualizar);
    document.addEventListener('visibilitychange', actualizar);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', actualizar);
      document.removeEventListener('visibilitychange', actualizar);
    };
  }, []);
  return hoy;
}
