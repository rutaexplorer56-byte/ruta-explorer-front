import { useEffect, useRef, useState } from 'react';
import fondoActual from '../assets/paisaje_hero2.png';
import '../styles/headerBackground.css';

// Los nombres 01-, 02-, 03- determinan el orden de las imágenes.
const archivos = import.meta.glob('../assets/header/*.{png,jpg,jpeg,webp,avif}', {
  eager: true, query: '?url', import: 'default',
});
const fondos = Object.entries(archivos).sort(([a], [b]) => a.localeCompare(b)).map(([, src]) => src);
const imagenes = fondos.length ? fondos : [fondoActual];
const POSICIONES_MOVIL = ['32% center', '35% center', 'center'];

export default function HeaderBackground() {
  const [{ actual, anterior }, setDiapositiva] = useState({ actual: 0, anterior: null });
  const [listas, setListas] = useState([]);
  const [visible, setVisible] = useState(true);
  const [reducirMovimiento, setReducirMovimiento] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const contenedor = useRef(null);
  const primeraFallida = useRef(false);

  useEffect(() => {
    const preferencia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const actualizar = () => setReducirMovimiento(preferencia.matches);
    preferencia.addEventListener('change', actualizar);
    let enPantalla = true;
    const actualizarVisibilidad = () => setVisible(enPantalla && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      enPantalla = entry.isIntersecting;
      actualizarVisibilidad();
    });
    observer.observe(contenedor.current);
    document.addEventListener('visibilitychange', actualizarVisibilidad);
    actualizarVisibilidad();
    return () => {
      observer.disconnect();
      preferencia.removeEventListener('change', actualizar);
      document.removeEventListener('visibilitychange', actualizarVisibilidad);
    };
  }, []);

  useEffect(() => {
    if (reducirMovimiento || !visible || listas.length < 2) return;
    const timer = window.setInterval(() => {
      setDiapositiva(prev => {
        for (let paso = 1; paso < imagenes.length; paso++) {
          const siguiente = (prev.actual + paso) % imagenes.length;
          if (listas.includes(siguiente)) return { actual: siguiente, anterior: prev.actual };
        }
        return prev;
      });
    }, 6000);
    return () => window.clearInterval(timer);
  }, [listas, reducirMovimiento, visible]);

  return <div className="header-background" ref={contenedor} aria-hidden="true">
    {imagenes.map((src, index) => <img
      key={src}
      className={`header-background-image${index === actual ? ' is-active' : index === anterior ? ' is-previous' : ''}`}
      src={src}
      alt=""
      style={{ '--header-image-position': POSICIONES_MOVIL[index] || 'center' }}
      loading={index === 0 ? 'eager' : 'lazy'}
      // eslint-disable-next-line react/no-unknown-property -- React 18 requiere el atributo HTML en minúsculas.
      fetchpriority={index === 0 ? 'high' : undefined}
      decoding="async"
      onLoad={() => {
        setListas(prev => prev.includes(index) ? prev : [...prev, index]);
        // Si falla la primera foto, mostrar la primera que consiga cargar.
        if (primeraFallida.current && listas.length === 0) setDiapositiva({ actual: index, anterior: null });
      }}
      onError={() => {
        if (index === 0) {
          primeraFallida.current = true;
          if (listas.length) setDiapositiva({ actual: listas[0], anterior: null });
        }
      }}
    />)}
    <div className="header-background-shade" />
  </div>;
}
