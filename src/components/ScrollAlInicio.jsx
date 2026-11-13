import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollAlInicio() {
  const { key } = useLocation();

  useLayoutEffect(() => {
    const anterior = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = anterior; };
  }, []);

  useLayoutEffect(() => {
    // Instantáneo incluso si el sitio usa scroll suave; también al volver/avanzar.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [key]);

  return null;
}
