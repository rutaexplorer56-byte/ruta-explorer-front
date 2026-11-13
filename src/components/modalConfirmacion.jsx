import { useTranslation } from "react-i18next";
import "../styles/modalConfirmacion.css";
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  titulo,
  mensaje,
  loading = false,
}) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-contenido"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button className="modal-close" onClick={onClose} aria-label={t('accionesUI.cerrar')}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p>{mensaje}</p>
        </div>

        <div className="modal-footer">
          <button className="btn cancelar" onClick={onClose}>
            {t('accionesUI.cancelar')}
          </button>

          <button
            className="btn confirmar"
            onClick={onConfirm}
            disabled={loading}
          >
            {t(loading ? 'accionesUI.guardando' : 'accionesUI.confirmar')}
          </button>
        </div>
      </div>
    </div>
  );
}
