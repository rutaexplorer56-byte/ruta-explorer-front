import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { optimizarImagenCloudinary } from '../utils/cloudinary';
import '../styles/galeriaTour.css';

/* eslint-disable react/prop-types */
function Foto({ src, alt, width, sizes, principal = false, ampliada = false }) {
  const { t } = useTranslation();
  const [fallo, setFallo] = useState(false);
  if (fallo) return <span className="rx-gallery-error" role="img" aria-label={alt}>
    <i className="bi bi-image" aria-hidden="true" />
    {t('galeriaTour.error')}
  </span>;

  return <img
    src={optimizarImagenCloudinary(src, width)}
    srcSet={sizes ? [480, 800, 1200].map(size => `${optimizarImagenCloudinary(src, size)} ${size}w`).join(', ') : undefined}
    sizes={sizes}
    alt={alt}
    loading={principal || ampliada ? 'eager' : 'lazy'}
    // eslint-disable-next-line react/no-unknown-property -- React 18 requiere el atributo HTML en minúsculas.
    fetchpriority={principal ? 'high' : undefined}
    decoding="async"
    onError={() => setFallo(true)}
  />;
}

export default function GaleriaTour({ fotos, nombre }) {
  const { t } = useTranslation();
  const imagenes = useMemo(() => Array.isArray(fotos)
    ? fotos.filter(src => typeof src === 'string' && src.trim())
    : [], [fotos]);
  const [movil, setMovil] = useState(() => window.matchMedia('(max-width: 600px)').matches);
  const [abierta, setAbierta] = useState(false);
  const [indice, setIndice] = useState(0);
  const dialogo = useRef(null);
  const miniaturaActiva = useRef(null);
  const total = imagenes.length;
  const visibles = imagenes.slice(0, movil ? 3 : 5);
  const actual = Math.min(indice, Math.max(0, total - 1));
  const etiqueta = index => t('galeriaTour.foto', { nombre, numero: index + 1 });

  useEffect(() => {
    const media = window.matchMedia('(max-width: 600px)');
    const actualizar = () => setMovil(media.matches);
    media.addEventListener('change', actualizar);
    return () => media.removeEventListener('change', actualizar);
  }, []);

  useEffect(() => {
    const modal = dialogo.current;
    if (!modal) return;
    if (!abierta) {
      if (modal.open) modal.close();
      return;
    }
    if (!modal.open) modal.showModal();
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflowAnterior; };
  }, [abierta]);

  useEffect(() => {
    if (abierta) miniaturaActiva.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [actual, abierta]);

  const abrir = index => { setIndice(index); setAbierta(true); };
  const mover = delta => setIndice(prev => (prev + delta + total) % total);

  if (!total) return <div className="rx-gallery-empty">{t('galeriaTour.vacia')}</div>;

  return <section className="rx-gallery" aria-label={t('galeriaTour.titulo', { nombre })}>
    <div className="rx-gallery-preview">
      <div className="rx-collage" data-count={visibles.length}>
        {visibles.map((src, index) => <button
          type="button"
          className="rx-collage-photo"
          key={`${src}-${index}`}
          aria-label={t('galeriaTour.abrir', { numero: index + 1 })}
          aria-haspopup="dialog"
          onClick={() => abrir(index)}
        >
          <Foto src={src} alt={etiqueta(index)} width={index === 0 ? 800 : 480} principal={index === 0}
            sizes={index === 0
              ? '(max-width: 600px) 100vw, (max-width: 1000px) 65vw, 50vw'
              : '(max-width: 600px) 50vw, 25vw'} />
        </button>)}
      </div>
      {total > 1 && <button type="button" className="rx-gallery-all" onClick={() => abrir(0)} aria-haspopup="dialog">
        <i className="bi bi-grid-3x3-gap" aria-hidden="true" />
        {t('galeriaTour.verTodas', { total })}
      </button>}
    </div>

    <dialog ref={dialogo} className="rx-gallery-dialog" aria-label={t('galeriaTour.titulo', { nombre })}
      onClose={() => setAbierta(false)}
      onClick={event => { if (event.target === event.currentTarget) setAbierta(false); }}
      onKeyDown={event => {
        if (total > 1 && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
          event.preventDefault();
          mover(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}>
      {abierta && <div className="rx-gallery-viewer">
        <div className="rx-gallery-toolbar">
          <span className="rx-gallery-name">{nombre}</span>
          <span className="rx-gallery-counter" aria-live="polite" aria-atomic="true">
            {t('galeriaTour.contador', { numero: actual + 1, total })}
          </span>
          <button type="button" className="rx-gallery-control" onClick={() => setAbierta(false)}
            aria-label={t('galeriaTour.cerrar')} autoFocus>
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </div>
        <div className="rx-gallery-stage">
          <Foto key={imagenes[actual]} src={imagenes[actual]} alt={etiqueta(actual)} width={1600} ampliada />
          {total > 1 && <>
            <button type="button" className="rx-gallery-control rx-gallery-prev" onClick={() => mover(-1)} aria-label={t('galeriaTour.anterior')}>
              <i className="bi bi-chevron-left" aria-hidden="true" />
            </button>
            <button type="button" className="rx-gallery-control rx-gallery-next" onClick={() => mover(1)} aria-label={t('galeriaTour.siguiente')}>
              <i className="bi bi-chevron-right" aria-hidden="true" />
            </button>
          </>}
        </div>
        {total > 1 && <div className="rx-gallery-thumbs" aria-label={t('galeriaTour.seleccionar')}>
          {imagenes.map((src, index) => <button type="button" key={`${src}-${index}`}
            ref={index === actual ? miniaturaActiva : null}
            aria-label={t('galeriaTour.abrir', { numero: index + 1 })}
            aria-current={index === actual ? 'true' : undefined}
            onClick={() => setIndice(index)}>
            <Foto src={src} alt={etiqueta(index)} width={160} />
          </button>)}
        </div>}
      </div>}
    </dialog>
  </section>;
}
