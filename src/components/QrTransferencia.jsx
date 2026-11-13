import contenido from '../data/condicionesPago.json';
import '../styles/pagoManual.css';

const imagenes = [
  { archivo: 'qr-bold.png', titulo: 'Bold · Bre-B', width: 500, height: 824 },
  { archivo: 'qr-bancolombia.png', titulo: 'Bancolombia · Bre-B', width: 574, height: 1023 },
];
export default function QrTransferencia() {
  return <section className="rx-qr-transferencia">
    <h3>{contenido.qrTitulo}</h3><p>{contenido.qrAyuda}</p>
    <div className="rx-qr-lista">{imagenes.map(qr => {
      const url = `${import.meta.env.BASE_URL}pagos/${qr.archivo}`;
      return <figure key={qr.archivo}>
        <figcaption>{qr.titulo}</figcaption>
        <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${contenido.verQr}: ${qr.titulo}`}>
          <img src={url} alt={`QR de pago ${qr.titulo}`} width={qr.width} height={qr.height} />
        </a>
        <a href={url} download={qr.archivo}>{contenido.descargarQr} · {qr.titulo}</a>
      </figure>;
    })}</div>
  </section>;
}
