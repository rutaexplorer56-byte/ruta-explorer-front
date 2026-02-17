import React from "react";
import "../styles/modalConfirmacion.css";
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  titulo,
  mensaje,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p>{mensaje}</p>
        </div>

        <div className="modal-footer">
          <button className="btn cancelar" onClick={onClose}>
            Cancelar
          </button>

          <button
            className="btn confirmar"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
