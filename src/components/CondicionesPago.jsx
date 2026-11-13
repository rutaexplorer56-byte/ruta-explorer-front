import { useEffect, useId, useRef, useState } from 'react';
import contenido from '../data/condicionesPago.json';
import '../styles/pagoManual.css';

export function TextoCondicionesPago() {
  return <ol className="rx-condiciones-lista">{contenido.condiciones.map(item => <li key={item.titulo}>
    <strong>{item.titulo}:</strong>
    {item.parrafos.map(texto => <p key={texto}>{texto}</p>)}
  </li>)}</ol>;
}

export default function CondicionesPago() {
  const [abierto, setAbierto] = useState(false);
  const dialogo = useRef(null);
  const tituloId = useId();
  useEffect(() => {
    if (!abierto) return;
    const modal = dialogo.current;
    modal.showModal();
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { modal.close(); document.body.style.overflow = anterior; };
  }, [abierto]);
  return <>
    <button type="button" className="rx-condiciones-abrir" aria-haspopup="dialog" onClick={() => setAbierto(true)}>{contenido.abrir}</button>
    <dialog ref={dialogo} className="rx-condiciones-modal" aria-labelledby={tituloId}
      onCancel={() => setAbierto(false)} onClose={() => setAbierto(false)}>
      <div className="rx-condiciones-cabecera">
        <h2 id={tituloId}>{contenido.titulo}</h2>
        <button type="button" onClick={() => setAbierto(false)} aria-label={contenido.cerrar}>×</button>
      </div>
      <TextoCondicionesPago />
      <button type="button" className="rx-condiciones-abrir" onClick={() => setAbierto(false)}>{contenido.cerrar}</button>
    </dialog>
  </>;
}
