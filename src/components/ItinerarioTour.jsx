import { useTranslation } from 'react-i18next';
import { obtenerItinerario, TIPOS_ITINERARIO } from '../utils/itinerario';
import '../styles/itinerario.css';

const ICONOS = { salida: 'bi-geo-fill', transporte: 'bi-hourglass-split', actividad: 'bi-map', llegada: 'bi-person-arms-up' };

/* eslint-disable react/prop-types */
export default function ItinerarioTour({ tour }) {
  const { t } = useTranslation();
  const pasos = obtenerItinerario(tour);
  if (!pasos.length) return null;
  return (
    <section className="itinerario itinerario-secuencia" aria-labelledby="itinerario-titulo">
      <h2 id="itinerario-titulo">{t('tour.itinerario')}</h2>
      <ol className="itinerario-lista">
        {pasos.map((paso, index) => (
          <li className="itinerario-paso" key={paso.id ?? `anterior-${index}`}>
            <span className="itinerario-numero" aria-label={t('itinerarioPasos.paso', { numero: paso.orden })}>{paso.orden}</span>
            <div className="itinerario-contenido">
              {paso.tipo && <span className="itinerario-tipo">
                <i className={`bi ${ICONOS[paso.tipo] || 'bi-map'}`} aria-hidden="true" />
                {TIPOS_ITINERARIO.includes(paso.tipo) ? t(`itinerarioPasos.tipos.${paso.tipo}`) : paso.tipo}
              </span>}
              <h3>{paso.titulo}</h3>
              {paso.descripcion && <p>{paso.descripcion}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
