import { useTranslation } from 'react-i18next';
import '../styles/metodosPago.css';
import { metodosPermitidos } from '../utils/pagos';
import CondicionesPago from './CondicionesPago';
import condiciones from '../data/condicionesPago.json';

/* eslint-disable react/prop-types */
export function ResumenPago({ pago }) {
  const { t } = useTranslation();
  const pesos = valor => `$${Number(valor).toLocaleString('es-CO')} COP`;
  return <dl className="pago-resumen" aria-live="polite">
    {pago.porcentajeDescuento > 0 && <>
      <div><dt>{t('metodosPago.totalOriginal')}</dt><dd>{pesos(pago.totalAntesDescuento)}</dd></div>
      <div><dt>{t('metodosPago.descuento', { porcentaje: pago.porcentajeDescuento })}</dt><dd>−{pesos(pago.valorDescuento)}</dd></div>
    </>}
    <div className="pago-total"><dt>{t('metodosPago.totalFinal')}</dt><dd>{pesos(pago.valorTotal)}</dd></div>
  </dl>;
}

export default function MetodoPago({ metodo, onChange, pago, disabled, metodos }) {
  const { t } = useTranslation();
  return <section className="metodos-pago">
    <fieldset disabled={disabled}>
      <legend>{t('metodosPago.seleccion')}</legend>
      {metodosPermitidos(metodos).map(valor => <label key={valor} className={`metodo-pago ${metodo === valor ? 'seleccionado' : ''}`}>
        <input type="radio" name="metodoPago" value={valor} checked={metodo === valor} onChange={() => onChange(valor)} />
        <span><strong>{t(`metodosPago.${valor}`)}</strong><small>{valor === 'efectivo' ? `${t('metodosPago.transferenciaDescripcion')} ${condiciones.efectivo}` : t(`metodosPago.${valor}Descripcion`)}</small></span>
      </label>)}
    </fieldset>
    <ResumenPago pago={pago} />
    {['efectivo', 'transferencia', 'efectivo_sin', 'transferencia_sin'].includes(metodo) && <CondicionesPago />}
  </section>;
}
