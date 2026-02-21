import React from "react";
import "../styles/terminos.css";
import { useTranslation } from "react-i18next";

/* eslint-disable react/prop-types */
const Terminos = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t("terms.title")}</h2>
          <button
            type="button"
            className="modal-close"
            aria-label={t("terms.cerrar")}
            onClick={onClose}
          >
            ✖
          </button>
        </div>

        <div className="modal-body">

          <strong>{t("terms.reservasPagosTitle")}</strong>
          <br />
          {t("terms.reservasPagosText")}
          <br /><br />

          <strong>{t("terms.cancelacionesTitle")}</strong>
          <br />
          <ul>
            <li>{t("terms.cancelacion1")}</li>
            <li>{t("terms.cancelacion2")}</li>
            <li>{t("terms.cancelacion3")}</li>
            <li>{t("terms.cancelacion4")}</li>
          </ul>

          <strong>{t("terms.responsabilidadTitle")}</strong>
          <br />
          {t("terms.responsabilidadText")}

        </div>

        <div className="modal-footer">
          <button type="button" className="btn cancelar" onClick={onClose}>
            {t("terms.cerrar")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Terminos;