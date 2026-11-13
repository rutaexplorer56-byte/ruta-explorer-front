import { useTranslation } from 'react-i18next';
import { ResumenPago } from './MetodoPago';
import CondicionesPago, { TextoCondicionesPago } from './CondicionesPago';
import QrTransferencia from './QrTransferencia';
import condiciones from '../data/condicionesPago.json';

/* eslint-disable react/prop-types */
export default function ReservaManual({ resultado }) {
  const { t } = useTranslation();
  const { reserva } = resultado;
  return <section className="reserva-manual">
    <h2>{t('metodosPago.reservaCreada')}</h2>
    <p className="pago-pendiente-aviso" role="status">{condiciones.aviso}</p>
    <dl className="pago-datos">
      <dt>{t('metodosPago.referencia')}</dt><dd>{reserva.referenciaPago}</dd>
      <dt>{t('metodosPago.tour')}</dt><dd>{reserva.nombreTour}</dd>
      <dt>{t('metodosPago.fecha')}</dt><dd>{reserva.fecha} · {reserva.horario}</dd>
      <dt>{t('metodosPago.seleccion')}</dt><dd>{t(`metodosPago.${reserva.metodoPago}`)}</dd>
    </dl>
    <ResumenPago pago={reserva} />
    {['transferencia', 'transferencia_sin'].includes(reserva.metodoPago) ? <QrTransferencia /> : <p>{condiciones.efectivo}</p>}
    <CondicionesPago />
    <details><summary>{condiciones.titulo}</summary><TextoCondicionesPago /></details>
  </section>;
}
