import { useTranslation } from 'react-i18next';
import Header from "../components/header";
import Footer from "../components/footer";
import { useEffect, useMemo, useState } from "react";
import "../styles/admin_reservations.css";
import axios from "../axiosConfig";
import * as XLSX from "xlsx";
import { set } from "date-fns";
import ConfirmModal from "../components/modalConfirmacion";
import EditarReserva from "../components/editarReserva";
import { toast } from "react-toastify";

const normalizarEstado = valor => valor === 'completado' ? 'finalizada' : (valor || 'pendiente');
const estadosReserva = ['pendiente', 'finalizada', 'cancelada'];

const autorizacion = () => ({ headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
export default function Admin_reservations() {
  const { t } = useTranslation();
  const nombreMetodo = metodo => ['bold', 'transferencia', 'efectivo', 'transferencia_sin', 'efectivo_sin'].includes(metodo) ? t('reservasPago.' + metodo) : t('reservasPago.anterior');
  const [reservas, setReservas] = useState([]);
  const [borradoresEstado, setBorradoresEstado] = useState({});
  const [confirmacionEstado, setConfirmacionEstado] = useState(null);
  const [resultadoEstado, setResultadoEstado] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [detalles, setDetalles] = useState(false);
  const [llave, setLlave] = useState("");

  // Filtros
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const[editar, setEditar] = useState(true);
  const [idReserva, setIdReserva] = useState(null);

  const [openConfirm, setOpenConfirm] = useState(false);
const [reservaAEliminar, setReservaAEliminar] = useState(null);
const [loadingDelete, setLoadingDelete] = useState(false);

  // Paginación (front)
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [q, estado, from, to]);

  // Cargar reservas
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await axios.get("/api/reservas");
         const sorted = [...res.data].sort((a, b) => b.id - a.id);
          setReservas(sorted);
      } catch (e) {
        console.error("Error al obtener reservas:", e);
        setErr("No se pudieron cargar las reservas.");
      } finally {
        setLoading(false);
      }
    })();
  }, [editar]);

  // Filtrado
  const filtered = useMemo(() => {
    return reservas.filter((r) => {
      const byEstado =
        estado === "Todos" ? true : normalizarEstado(r.estado).toLowerCase() === estado.toLowerCase();

      const text = `${r?.nombrePersona || ""} ${r?.nombreTour || ""} ${r?.hotel || ""}`.toLowerCase();
      const byQuery = q.trim() ? text.includes(q.toLowerCase()) : true;

      const d = r?.fecha ? new Date(r.fecha).getTime() : null;
      const okFrom = from ? (d ? d >= new Date(from).getTime() : false) : true;
      const okTo   = to   ? (d ? d <= new Date(to).getTime()   : false) : true;

      return byEstado && byQuery && okFrom && okTo;
    });
  }, [reservas, q, estado, from, to]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  const [savingIds, setSavingIds] = useState(new Set());
  useEffect(() => setPage(actual => Math.min(actual, totalPages)), [totalPages]);
  const toggleEstado = async (reserva, nuevo) => {
    if (savingIds.has(reserva.id) || nuevo === normalizarEstado(reserva.estado)) return;
    setSavingIds(s => new Set([...s, reserva.id]));
    setResultadoEstado(actual => ({ ...actual, [reserva.id]: { tipo: 'guardando', texto: 'Guardando cambio...' } }));
    try {
      const { data } = await axios.put('/api/reservas/' + reserva.id, { estado: nuevo }, autorizacion());
      setReservas(actual => actual.map(r => r.id === reserva.id ? { ...r, ...data.reserva, estado: normalizarEstado(data.reserva?.estado || nuevo) } : r));
      setBorradoresEstado(actual => { const copia = { ...actual }; delete copia[reserva.id]; return copia; });
      setResultadoEstado(actual => ({ ...actual, [reserva.id]: { tipo: 'exito', texto: 'Estado guardado: ' + nuevo + '.' } }));
      toast.success('Reserva #' + reserva.id + ': estado actualizado a ' + nuevo + '.');
      if (data.advertencia) toast.warn(data.advertencia);
      else if (data.correoResena === 'enviado') toast.info('El correo de agradecimiento fue aceptado para envío.');
      setConfirmacionEstado(null);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setResultadoEstado(actual => ({ ...actual, [reserva.id]: { tipo: 'error', texto: 'No se pudo guardar. Inténtalo de nuevo.' } }));
      toast.error('No se pudo actualizar el estado. El cambio sigue pendiente.');
      setConfirmacionEstado(null);
    } finally {
      setSavingIds(s => { const copia = new Set(s); copia.delete(reserva.id); return copia; });
    }
  };

 const pedirConfirmacionPago = (reserva) => {
  setReservaSeleccionada(reserva);
  setModalOpen(true);
} 

const confirmarCambioPago = async () => {
  await toggleEstadoPago(reservaSeleccionada);
  setModalOpen(false);
  setReservaSeleccionada(null);
};
const toggleEstadoPago = async (reserva) => {
  const nuevo = reserva.estadoPago === "pago" ? "pendiente" : "pago";

  // Optimistic update
  setReservas((curr) =>
    curr.map((r) =>
      r.id === reserva.id ? { ...r, estadoPago: nuevo } : r
    )
  );

  setSavingIds((s) => new Set([...s, reserva.id]));

  try {
    const { data } = await axios.put(`/api/reservas/${reserva.id}`, {
      estadoPago: nuevo,
    }, autorizacion());
    if (data.advertencia) toast.warn(t('reservasPago.correoFallido'));
    else if (data.correoPago === 'enviado') toast.success(t('reservasPago.correoEnviado'));
  } catch (error) {
    console.error("Error al actualizar estadoPago:", error);
    // rollback
    setReservas((curr) =>
      curr.map((r) =>
        r.id === reserva.id ? { ...r, estadoPago: reserva.estadoPago } : r
      )
    );
    toast.error(t('reservasPago.errorEstado'));
  } finally {
    setSavingIds((s) => {
      const copy = new Set(s);
      copy.delete(reserva.id);
      return copy;
    });
    
  }
};
const pedirConfirmacionEliminar = (id) => {
  setReservaAEliminar(id);
  setOpenConfirm(true);
};

const cerrarConfirmacion = () => {
  if (loadingDelete) return; // evita cerrar mientras elimina
  setOpenConfirm(false);
  setReservaAEliminar(null);
};

const confirmarEliminarReserva = async () => {
  if (!reservaAEliminar) return;

  try {
    setLoadingDelete(true);

    await axios.delete(`/api/reservas/${reservaAEliminar}`);

    toast.success("Reserva eliminada exitosamente");
    setReservas((curr) => curr.filter((r) => r.id !== reservaAEliminar));

    setOpenConfirm(false);
    setReservaAEliminar(null);
  } catch (error) {
    console.error("Error al eliminar reserva:", error);
    toast.error(
      error?.response?.data?.message ||
      error?.response?.data?.mensaje ||
      "No se pudo eliminar la reserva. Inténtalo de nuevo."
    );
  } finally {
    setLoadingDelete(false);
  }
};



const downloadExcel = () => {
  // ✅ Exporta SOLO lo filtrado (no solo la página)
  const rows = filtered.map((r) => ({
    ID: r.id,
    Fecha: r.fecha ? new Date(r.fecha).toLocaleDateString("es-CO") : "",
    Estado: normalizarEstado(r.estado),
    Cliente: r.nombrePersona || "",
    Tour: r.nombreTour || "",
    Hotel: r.hotel || "",
    Personas: r.cantidadPersonas ?? "",
    Total: r.total ?? r.valor ?? "",
    Teléfono: r.telefono || "",
    Email: r.correo || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reservas");

  // auto ancho simple (opcional)
  const colWidths = Object.keys(rows[0] || {}).map((k) => ({
    wch: Math.max(k.length, ...rows.map((r) => String(r[k] ?? "").length)) + 2,
  }));
  ws["!cols"] = colWidths;

  const name = `reservas_filtradas_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, name);
};


// console.log("Reservas filtradas para Excel:", filtered);

  return (
    <>
    <ConfirmModal
      open={Boolean(confirmacionEstado)}
      onClose={() => { if (!savingIds.has(confirmacionEstado?.reserva.id)) setConfirmacionEstado(null); }}
      onConfirm={() => toggleEstado(confirmacionEstado.reserva, confirmacionEstado.nuevo)}
      titulo="Guardar estado de la reserva"
      mensaje={confirmacionEstado ? '¿Deseas cambiar la reserva #' + confirmacionEstado.reserva.id + ' de “' + normalizarEstado(confirmacionEstado.reserva.estado) + '” a “' + confirmacionEstado.nuevo + '”?' + (confirmacionEstado.nuevo === 'finalizada' ? ' Al finalizar se podrá enviar el correo de agradecimiento.' : '') : ''}
      loading={savingIds.has(confirmacionEstado?.reserva.id)}
    />
    <ConfirmModal
      open={openConfirm}
      onClose={cerrarConfirmacion}
      onConfirm={confirmarEliminarReserva}
      titulo="Eliminar reserva"
      mensaje="¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer."
      loading={loadingDelete}
    />
    <ConfirmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmarCambioPago}
        titulo={t("reservasPago.confirmarTitulo")}
        mensaje={t(reservaSeleccionada?.estadoPago === "pago" ? "reservasPago.pendienteMensaje" : "reservasPago.confirmarMensaje")}
      />
      <Header />
      {editar ? (
        <>
         <h2 className="descripcion_tours" style={{ textAlign: "center" }}>Tus reservas</h2>

      <div className="container_reservations">
        <div className="tabla-container">
          {/* Toolbar */}
          <div className="table-toolbar">
            <input
              className="table-search"
              type="text"
              placeholder="Buscar por nombre, tour o hotel..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <div className="toolbar-right">
              <select
                className="table-select"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option>Todos</option>
                <option>pendiente</option>
                <option>finalizada</option>
                <option>cancelada</option>
              </select>

              <input
                className="table-date"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                title="Desde"
              />
              <input
                className="table-date"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                title="Hasta"
              />
              <button
                    onClick={downloadExcel}
                    disabled={filtered.length === 0}
                    className="table-date excel"
                  >
                    Descargar Excel ({filtered.length})
                  </button>
            </div>
          </div>

          {loading && <p style={{ marginTop: 12 }}>Cargando…</p>}
          {err && !loading && <p className="error" style={{ marginTop: 12 }}>{err}</p>}

          {/* Tabla */}
          <div className="contenedor-reservas">

            {pageRows.map((reservas, i) => (
            <div key={reservas.id} className={`${detalles && llave==reservas.id ? "reserva-detalles" : "reserva"}`}>
              <div className="header-reserva">
                <button type="button" disabled={savingIds.has(reservas.id)}
                  className={`logo-reserva confirmar-pago-reserva ${
                    reservas.estadoPago === "pago" ? "" : "pago-pendiente"
                  }`}
                  onClick={() => pedirConfirmacionPago(reservas)}
                  title={t(reservas.estadoPago === 'pago' ? 'reservasPago.marcarPendiente' : 'reservasPago.confirmar')}
                  aria-label={t(reservas.estadoPago === 'pago' ? 'reservasPago.marcarPendiente' : 'reservasPago.confirmar')}
                  style={{
                    cursor: "pointer",
                    opacity: savingIds.has(reservas.id) ? 0.6 : 1,
                    pointerEvents: savingIds.has(reservas.id) ? "none" : "auto",
                  }}
                >
                  {reservas.estadoPago === "pago" ? (
                    <i className="bi bi-coin"></i>
                  ) : (
                    <i className="bi bi-hourglass-split"></i>
                  )}
                  <span>{t(reservas.estadoPago === "pago" ? "reservasPago.pago" : "reservasPago.confirmar")}</span>
                </button>
                <div className="titulo-reserva">
                  <h3 className="nombre-reserva">{reservas.nombreTour}</h3>
                  <p className="id-reserva">#{reservas.id} </p>
                  <p className="idioma-reserva"><i className="bi bi-translate"></i> {reservas.idioma}</p>
                  
                </div>
                <div className="boton-reserva">
                  <form className="reserva-estado-form" aria-busy={savingIds.has(reservas.id)} onSubmit={event => {
                    event.preventDefault();
                    const nuevo = borradoresEstado[reservas.id] ?? normalizarEstado(reservas.estado);
                    if (nuevo !== normalizarEstado(reservas.estado) && !savingIds.has(reservas.id)) setConfirmacionEstado({ reserva: reservas, nuevo });
                  }}>
                    <div className="reserva-estado-controles">
                      <select name="estado" aria-label={'Estado de la reserva #' + reservas.id}
                        className={'estado-' + (borradoresEstado[reservas.id] ?? normalizarEstado(reservas.estado))}
                        value={borradoresEstado[reservas.id] ?? normalizarEstado(reservas.estado)}
                        onChange={event => {
                          setBorradoresEstado(actual => ({ ...actual, [reservas.id]: event.target.value }));
                          setResultadoEstado(actual => ({ ...actual, [reservas.id]: null }));
                        }} disabled={savingIds.has(reservas.id)}>
                        {!estadosReserva.includes(normalizarEstado(reservas.estado)) && <option value={reservas.estado}>{reservas.estado}</option>}
                        {estadosReserva.map(valor => <option key={valor} value={valor}>{valor}</option>)}
                      </select>
                      <button type="submit" disabled={savingIds.has(reservas.id) || (borradoresEstado[reservas.id] ?? normalizarEstado(reservas.estado)) === normalizarEstado(reservas.estado)}>
                        {savingIds.has(reservas.id) ? 'Guardando...' : 'Guardar estado'}
                      </button>
                    </div>
                    {resultadoEstado[reservas.id]?.tipo !== 'exito' && <span className={'reserva-estado-mensaje ' + (resultadoEstado[reservas.id]?.tipo || '')} role="status" aria-live="polite">
                      {resultadoEstado[reservas.id]?.texto || ((borradoresEstado[reservas.id] ?? normalizarEstado(reservas.estado)) !== normalizarEstado(reservas.estado) ? 'Cambio pendiente de guardar' : '')}
                    </span>}
                  </form>


                </div>
                <div className="info-reserva">
                  
                  <p className="fecha-reserva"><i className="bi bi-calendar4-week"></i> {reservas?.fecha}</p>
                  <p className="horario-reserva"><i className="bi bi-stopwatch"></i> {reservas?.horario}</p>
                  <p className="personas-reserva"><i className="bi bi-ticket-perforated"></i>  {reservas?.cantidadPersonas} Personas</p>
                  <p className="metodo-reserva">{t("metodosPago.seleccion")}: <strong>{nombreMetodo(reservas.metodoPago)}</strong></p>
                  <p className="metodo-reserva">{t("reservasPago.estado")}: <strong>{t('reservasPago.' + (reservas.estadoPago || 'pendiente'), { defaultValue: reservas.estadoPago })}</strong></p>
                  <p className="precio-reserva">${reservas?.valorTotal} COP</p>
                  <button className="btn-editar" onClick={()=>{setIdReserva(reservas.id); setEditar(!editar)}} >Editar</button>
                  <button className="btn-eliminar" onClick={() => pedirConfirmacionEliminar(reservas.id)}>Eliminar</button>

                </div>
                
                
                <div className="detalles">
                  <button className="btn-detalles" onClick={()=>{
                    setDetalles(!detalles) 
                    setLlave(reservas.id)}}>{detalles && llave==reservas.id ?"Ocultar Detalles":"Mostrar Detalles"}</button>
                </div>
              </div>
              <div className="body-reserva">
                <div className="titulos-detalles">
                  <p className="detalle-titulo">Referencia de la reserva</p>
                  <p className="detalle-titulo">Nombre</p>
                  <p className="detalle-titulo">Correo</p> 
                  <p className="detalle-titulo">Documento</p> 
                  <p className="detalle-titulo">Teléfono</p> 
                  <p className="detalle-titulo">Idioma</p> 
                  <p className="detalle-titulo">Hotel</p> 
                  <p className="detalle-titulo">Hotel del Cliente</p> 
                  <p className="detalle-titulo">País</p> 
                  <p className="detalle-titulo">Cantidad de personas</p>
                  <p className="detalle-titulo">Extras</p>
                  <p className="detalle-titulo">Total</p>
                  <p className="detalle-titulo">Estado del Pago</p>  

                </div>
                <div className="detalle-reserva">
                  <p className="detalle-info">{reservas.referenciaPago}</p>
                  <p className="detalle-info">{reservas.nombrePersona}</p>
                  <p className="detalle-info">{reservas.correo}</p>
                  <p className="detalle-info">{reservas.tipoDocumento}: {reservas.numeroDocumento}</p> 
                  <p className="detalle-info">{reservas.telefono}</p> 
                  <p className="detalle-info">{reservas.idioma}</p> 
                  <p className="detalle-info">{reservas.hotel}</p> 
                  <p className="detalle-info">{reservas.hotelCliente}</p>
                  <p className="detalle-info">{reservas.pais}</p>
                  <p className="detalle-info">{reservas.cantidadPersonas}</p>
                  <div className="detalle-info">
                    {reservas.extras && reservas.extras.length > 0 ? (
                    <ul className="extras-list">
                      {reservas.extras.map((extra, i) => (
                        <li key={i}>
                          <strong>{extra.nombre}</strong>  
                          {" "}x{extra.cantidad}  
                          {" "}— {extra.valor == null ? '—' : `$${Number(extra.valor).toLocaleString("es-CO")}`} c/u
                          {" "}→ <b>{extra.subtotal == null ? '—' : `$${Number(extra.subtotal).toLocaleString("es-CO")}`}</b>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <strong>Ninguno</strong>
                  )}
                  </div>
                  <p className="detalle-info">{t("metodosPago.seleccion")}: {nombreMetodo(reservas.metodoPago)}</p>
                  {reservas.porcentajeDescuento > 0 && <p className="detalle-info">
                    {t("metodosPago.totalOriginal")}: ${Number(reservas.totalAntesDescuento).toLocaleString('es-CO')} COP<br />
                    {t("metodosPago.descuento", { porcentaje: reservas.porcentajeDescuento })}: -${Number(reservas.valorDescuento).toLocaleString('es-CO')} COP
                  </p>}
                  <p className="detalle-info">${reservas.valorTotal}</p>  
                  <p className={`${reservas.estadoPago === "pago" ? "pago" : "pendiente"} `}>{t(reservas.estadoPago === "pago" ? "reservasPago.pago" : "reservasPago.pendiente")}</p>
                </div>



              </div>

            </div>
             ))}


          </div>
         

              {pageRows.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="empty">Sin resultados.</td>
                </tr>
              )}
            

          {/* Pie + paginación */}
          <div className="table-foot">
            <span>
              Mostrando {filtered.length === 0 ? 0 : start + 1} a {Math.min(start + PAGE_SIZE, filtered.length)} de {filtered.length} resultados
            </span>
            <div className="pager">
              <button
                className="page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Página anterior"
              >
                «
              </button>
              {Array.from({ length: totalPages }, (_, n) => n + 1).map((n) => (
                <button
                  key={n}
                  className={`page-btn${n === page ? " active" : ""}`}
                  onClick={() => setPage(n)}
                  aria-current={n === page ? "page" : undefined}
                >
                  {n}
                </button>
              ))}
              <button
                className="page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Página siguiente"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div> </>
      ):(<EditarReserva onClose={()=>setEditar(!editar)} id={idReserva} ></EditarReserva>)}

     

      <Footer />
    </>
  );
}

