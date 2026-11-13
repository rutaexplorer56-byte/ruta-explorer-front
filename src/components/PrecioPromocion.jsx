import { useTranslation } from 'react-i18next';
import '../styles/promocion.css';

/* eslint-disable react/prop-types */
export default function PrecioPromocion({ precioNormal, precioPromocion }) {
  const { t } = useTranslation();
  return (
    <div className="promocion-precio">
      <span className="promocion-distintivo">{t('promocion.distintivo')}</span>
      <del aria-label={t('promocion.precioAnterior')}>${Number(precioNormal).toLocaleString('es-CO')} COP</del>
      <strong aria-label={t('promocion.precioActual')}>${Number(precioPromocion).toLocaleString('es-CO')} COP</strong>
      <small>{t('promocion.porPersona')}</small>
      <small>{t('promocion.cualquierCantidad')}</small>
    </div>
  );
}
