import { importarItinerarioAntiguo, moverPasoItinerario, TIPOS_ITINERARIO } from '../utils/itinerario';
import '../styles/itinerario.css';

/* eslint-disable react/prop-types */
export default function ItinerarioEditor({ pasos: pasosRecibidos, onChange, itinerarioAntiguo: textoAnterior }) {
  const pasos = Array.isArray(pasosRecibidos) ? pasosRecibidos : [];
  const itinerarioAntiguo = typeof textoAnterior === 'string' ? textoAnterior : '';
  const actualizar = (indice, campo, valor) => onChange(pasos.map((paso, i) => i === indice ? { ...paso, [campo]: valor } : paso));
  return (
    <section className="itinerario-editor" aria-labelledby="itinerario-editor-titulo">
      <h3 id="itinerario-editor-titulo">Itinerario por pasos</h3>
      <p>Agrega cada parte del recorrido y utiliza Subir o Bajar para cambiar su posición.</p>
      {itinerarioAntiguo.trim() && (
        <div className="itinerario-respaldo">
          <details>
            <summary>Ver itinerario anterior conservado</summary>
            <p>{itinerarioAntiguo}</p>
          </details>
          {!pasos.length && <>
            <p>Mientras no guardes pasos nuevos, se seguirá mostrando el itinerario anterior.</p>
            <button type="button" onClick={() => onChange(importarItinerarioAntiguo(itinerarioAntiguo))}>
              Copiar itinerario anterior al editor
            </button>
            <p>Revisa el resultado y completa las descripciones que falten. El texto original se conservará.</p>
          </>}
        </div>
      )}
      {!pasos.length && !itinerarioAntiguo.trim() && <p>Todavía no hay pasos en este itinerario.</p>}
      {pasos.map((paso, index) => (
        <fieldset className="itinerario-editor-paso" key={paso.id ?? paso.claveLocal}>
          <legend>Paso {index + 1}</legend>
          <div className="itinerario-editor-campos">
            <label>Tipo
              <select value={paso.tipo} onChange={event => actualizar(index, 'tipo', event.target.value)}>
                {TIPOS_ITINERARIO.map(tipo => <option key={tipo} value={tipo}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</option>)}
              </select>
            </label>
            <label>Título
              <input type="text" maxLength={255} value={paso.titulo} aria-required="true"
                onChange={event => actualizar(index, 'titulo', event.target.value)} />
            </label>
          </div>
          <label>Descripción
            <textarea rows={3} value={paso.descripcion} aria-required="true"
              onChange={event => actualizar(index, 'descripcion', event.target.value)} />
          </label>
          <div className="itinerario-editor-acciones">
            <button type="button" disabled={index === 0} aria-label={`Subir paso ${index + 1}`}
              onClick={() => onChange(moverPasoItinerario(pasos, index, index - 1))}>↑ Subir</button>
            <button type="button" disabled={index === pasos.length - 1} aria-label={`Bajar paso ${index + 1}`}
              onClick={() => onChange(moverPasoItinerario(pasos, index, index + 1))}>↓ Bajar</button>
            <button type="button" className="itinerario-eliminar" aria-label={`Eliminar paso ${index + 1}`}
              onClick={() => onChange(pasos.filter((_, i) => i !== index))}>Eliminar paso</button>
          </div>
        </fieldset>
      ))}
      <button type="button" className="btn azul" onClick={() => onChange([
        ...pasos, { tipo: 'actividad', titulo: '', descripcion: '', claveLocal: crypto.randomUUID() },
      ])}>Agregar paso</button>
    </section>
  );
}
