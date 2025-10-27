import React from "react";
import "../styles/terminos.css";

/* eslint-disable react/prop-types */
const Terminos = ({ isOpen, onClose, title = "Términos y Condiciones", children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="modal-close"
            aria-label="Cerrar"
            onClick={onClose}
          >
            ✖
          </button>
        </div>

        <div className="modal-body">
          
           <strong>Reservas y Pagos: </strong> 
           <br></br>
            Las reservas se confirman con el pago total del servicio a través de nuestra pasarela de pago segura. El valor PAGADO garantiza la disponibilidad del servicio en la fecha seleccionada.<br></br>

           <strong>Cancelaciones y Devoluciones:</strong> <br></br>
           <ul>
                <li>Cancelaciones con más de 48 horas de anticipación podrán reprogramarse sin penalidad o solicitar reembolso.</li>
                <li>En caso de reembolso, se descontará un 14% del valor total pagado, correspondiente a costos de transacción y gastos administrativos.</li>
                <li>Cancelaciones con menos de 48 horas de anticipación o la no presentación el día del tour no son reembolsables.</li>
                <li>Si el servicio no puede realizarse por condiciones climáticas o causas ajenas a la empresa, se ofrecerá reprogramación o bono para uso futuro.</li>
           </ul>

            <strong>Responsabilidad:</strong> <br></br>
            garantizamos calidad y seguridad en la operación. No nos hacemos responsables por pérdida de objetos personales ni retrasos ocasionados por causas de fuerza mayor.
            Al realizar la compra, el cliente declara haber leído y aceptado estos términos y condiciones.
        </div>

        <div className="modal-footer">
          <button type="button" className="btn cancelar" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Terminos;