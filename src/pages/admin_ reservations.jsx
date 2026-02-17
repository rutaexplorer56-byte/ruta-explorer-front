import Header from "../components/header";
import Footer from "../components/footer";
import { useEffect, useMemo, useState } from "react";
import "../styles/Admin_reservations.css";
import axios from "../axiosConfig";
import * as XLSX from "xlsx";
import { set } from "date-fns";
import ConfirmModal from "../components/modalConfirmacion";
import EditarReserva from "../components/editarReserva";
import { toast } from "react-toastify";

export default function Admin_reservations() {
  const [reservas, setReservas] = useState([]);
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
        estado === "Todos" ? true : (r.estado || "").toLowerCase() === estado.toLowerCase();

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

  // Toggle estado (optimista)
  const [savingIds, setSavingIds] = useState(new Set());
  const toggleEstado = async (reserva) => {
    const nuevo = reserva.estado === "pendiente" ? "finalizada" : "pendiente";

    setReservas((curr) => curr.map((r) => (r.id === reserva.id ? { ...r, estado: nuevo } : r)));
    setSavingIds((s) => new Set([...s, reserva.id]));

    try {
      await axios.put(`/api/reservas/${reserva.id}`, { estado: nuevo });
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      // rollback
      setReservas((curr) => curr.map((r) => (r.id === reserva.id ? { ...r, estado: reserva.estado } : r)));
      alert("No se pudo actualizar el estado. Inténtalo de nuevo.");
    } finally {
      setSavingIds((s) => {
        const copy = new Set(s);
        copy.delete(reserva.id);
        return copy;
      });
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
    await axios.put(`/api/reservas/${reserva.id}`, {
      estadoPago: nuevo,
    });
  } catch (error) {
    console.error("Error al actualizar estadoPago:", error);
    // rollback
    setReservas((curr) =>
      curr.map((r) =>
        r.id === reserva.id ? { ...r, estadoPago: reserva.estadoPago } : r
      )
    );
    toast.error("No se pudo actualizar el estado de pago. Inténtalo de nuevo.");
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
    Estado: r.estado || "",
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
        titulo="Confirmar cambio de estado de pago"
        mensaje={`¿Deseas marcar esta reserva como ${
          reservaSeleccionada?.estadoPago === "pago"
            ? "pendiente"
            : "pagada"
        }?`}
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
                <div
                  className={`logo-reserva ${
                    reservas.estadoPago === "pago" ? "" : "pago-pendiente"
                  }`}
                  onClick={() => pedirConfirmacionPago(reservas)}
                  role="button"
                  title={reservas.estadoPago}
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
                </div>
                <div className="titulo-reserva">
                  <h3 className="nombre-reserva">{reservas.nombreTour}</h3>
                  <p className="id-reserva">#{reservas.id} </p>
                  <p className="idioma-reserva"><i className="bi bi-translate"></i> {reservas.idioma}</p>
                  
                </div>
                <div className="boton-reserva">
                  <div
                      className={`estado-toggle ${reservas.estado === "finalizada" ? "finalizada" : ""}`}
                      onClick={() => toggleEstado(reservas)}
                      title={reservas.estado}
                      role="button"
                      aria-label="Cambiar estado"
                      style={{ opacity: savingIds.has(reservas.id) ? 0.6 : 1, pointerEvents: savingIds.has(reservas.id) ? "none" : "auto" }}
                    />
                    <p className={`${reservas.estado === "finalizada" ? "pago" : "pendiente"}`}>{reservas.estado}</p>


                </div>
                <div className="info-reserva">
                  
                  <p className="fecha-reserva"><i className="bi bi-calendar4-week"></i> {reservas?.fecha}</p>
                  <p className="horario-reserva"><i className="bi bi-stopwatch"></i> {reservas?.horario}</p>
                  <p className="personas-reserva"><i className="bi bi-ticket-perforated"></i>  {reservas?.cantidadPersonas} Personas</p>
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
                  <p className="detalle-titulo">Teléfono</p> 
                  <p className="detalle-titulo">Idioma</p> 
                  <p className="detalle-titulo">Hotel</p> 
                  <p className="detalle-titulo">Cantidad de personas</p>
                  <p className="detalle-titulo">Extras</p>
                  <p className="detalle-titulo">Total</p>
                  <p className="detalle-titulo">Estado del Pago</p>  

                </div>
                <div className="detalle-reserva">
                  <p className="detalle-info">{reservas.referenciaPago}</p>
                  <p className="detalle-info">{reservas.nombrePersona}</p>
                  <p className="detalle-info">{reservas.correo}</p> 
                  <p className="detalle-info">{reservas.telefono}</p> 
                  <p className="detalle-info">{reservas.idioma}</p> 
                  <p className="detalle-info">{reservas.hotel}</p> 
                  <p className="detalle-info">{reservas.cantidadPersonas}</p>
                  <div className="detalle-info">
                    {reservas.extras && reservas.extras.length > 0 ? (
                    <ul className="extras-list">
                      {reservas.extras.map((extra, i) => (
                        <li key={i}>
                          <strong>{extra.nombre}</strong>  
                          {" "}x{extra.cantidad}  
                          {" "}— ${extra.valor.toLocaleString("es-CO")} c/u  
                          {" "}→ <b>${extra.subtotal.toLocaleString("es-CO")}</b>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <strong>Ninguno</strong>
                  )}
                  </div>
                  <p className="detalle-info">${reservas.valorTotal}</p>  
                  <p className={`${reservas.estadoPago === "pago" ? "pago" : "pendiente"} `}>{reservas.estadoPago === "pago" ? "pago" : "Pendiente"}</p>
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


