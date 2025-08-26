
import "../styles/invoice.css";
import Header from "../components/header";
import { useEffect, useRef } from 'react';
import  { useState } from 'react'
import axios from "../axiosConfig";
import { useSearchParams } from "react-router-dom";

/* eslint-disable react/prop-types */
 function Invoice(){

  const [reserva, setReserva] = useState('');
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("bold-order-id");
  const txStatus = searchParams.get("bold-tx-status");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const postedRef = useRef(false);

  useEffect(() => {
  let cancelado = false;

  const confirmarYLuegoLeer = async () => {
    if (!orderId) {
      if (!cancelado) {
        setError("No se pudo completar el pago.");
        setCargando(false);
      }
      return;
    }

    try {
      setCargando(true);

      // 🔹 Evitar doble POST
      if (txStatus === "approved" && !postedRef.current) {
        postedRef.current = true;
        await axios.post(`/api/reservas/webhook`, {
          reference: orderId,
          status: "pago",
        });
      }

      // 🔹 Leer la reserva siempre
      const { data } = await axios.get(`/api/reservas/referencia/${orderId}`);
      if (!cancelado) {
        setReserva(data);
        setError("");
      }
    } catch (e) {
      if (!cancelado) {
        setError("No fue posible cargar/confirmar la reserva.");
      }
      console.error(e);
    } finally {
      if (!cancelado) setCargando(false);
    }
  };

  confirmarYLuegoLeer();

  return () => {
    cancelado = true; // evita setState después de desmontar
  };
}, []);


  
    const aprobado = txStatus === "approved";
  const tituloMostrar = aprobado ? "¡Pago aprobado!":"";

  return (
    <>
    <Header></Header>

      <div className="receipt-wrapper">
        <div className="receipt-card">
          

          <div className="receipt-status">
            <div className="icon-check">{aprobado ? "✓" : "ℹ"}</div>
            <h2>{tituloMostrar}</h2>

            {/* Total: si viene de la reserva, úsalo; si no, muestra 0 COP */}
            <div className="receipt-amount">
              {(reserva?.valorTotal)} COP
            </div>

            <div className="receipt-date">{new Date().toLocaleString("es-CO")}</div>

            {txStatus && (
              <div className="receipt-status-chip">
                Estado de transacción: <strong>{txStatus=="approved"?"pago exitoso":"pago rechazado"}</strong>
              </div>
            )}
          </div>

          {cargando && <p>Cargando reserva…</p>}
          {error && <p style={{ color: "crimson" }}>{error}</p>}

          
          {reserva && (
            <>
              <div className="receipt-table">
              

                <div className="row">
                  <span>Referencia de pago</span>
                  <strong>{reserva.referenciaPago}</strong>
                </div>
                <div className="row">
                  <span>Nombre del tour</span>
                  <strong>{reserva.nombreTour}</strong>
                </div>
                <div className="row">
                  <span>Cantidad de personas</span>
                  <strong>{reserva.cantidadPersonas}</strong>
                </div>
                <div className="row">
                  <span>Fecha del tour</span>
                  <strong>{reserva.fecha}</strong>
                </div>
                <div className="row">
                  <span>Horario</span>
                  <strong>{reserva.horario}</strong>
                </div>
                <div className="row">
                  <span>Nombre </span>
                  <strong>{reserva.nombrePersona}</strong>
                </div>
                <div className="row">
                  <span>Correo</span>
                  <strong>{reserva.correo}</strong>
                </div>
                <div className="row">
                  <span>Estado de la reserva</span>
                  <strong>{reserva.estado}</strong>
                </div>
                <div className="row">
                  <span>Estado de pago</span>
                  <strong>{reserva.estadoPago}</strong>
                </div>
              </div>

              <div className="receipt-total">
                <span>Total</span>
                <strong>{(reserva.valorTotal)} COP</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </>
    
  );
}
export default Invoice;