import Header from "../components/header";
import Footer from "../components/footer";
import { useEffect, useMemo, useState } from "react";
import "../styles/Admin_reservations.css";
import axios from "../axiosConfig";

export default function Admin_reservations() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Filtros
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

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
  }, []);

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


  return (
    <>
      <Header />
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
            </div>
          </div>

          {loading && <p style={{ marginTop: 12 }}>Cargando…</p>}
          {err && !loading && <p className="error" style={{ marginTop: 12 }}>{err}</p>}

          {/* Tabla */}
          <table className="tabla-reservas">
            <thead>
              <tr>
                <th>#</th>
                <th>Título</th>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Personas</th>
                <th>Hora</th>
                <th>Comisión</th>
                <th>Telefono</th>
                <th>Correo</th>
                <th>Pago</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((reserva, i) => (
                <tr key={reserva.id}>
                  <td className="id_table">{reserva.id}</td>
                  <td>{reserva.nombreTour}</td>
                  <td>{reserva.nombrePersona}</td>
                  <td>{formatDate(reserva.fecha)}</td>
                  <td>{reserva.cantidadPersonas}</td>
                  <td>{reserva.horario || "-"}</td>
                  <td>{reserva.hotel || ""}</td>
                  <td>{reserva.telefono || "-"}</td>
                  <td className="correo">{reserva.correo || "-"}</td>
                  <td ><p className={`${reserva.estadoPago === "pago" ? "pago" : "cancelado"}`}>{`${reserva.estadoPago === "pago" ? "pago" : "Cancelado"}`}</p></td>
                  <td className="td-estado">
                    <div
                      className={`estado-toggle ${reserva.estado === "finalizada" ? "finalizada" : ""}`}
                      onClick={() => toggleEstado(reserva)}
                      title={reserva.estado}
                      role="button"
                      aria-label="Cambiar estado"
                      style={{ opacity: savingIds.has(reserva.id) ? 0.6 : 1, pointerEvents: savingIds.has(reserva.id) ? "none" : "auto" }}
                    />
                    <p className={`${reserva.estado === "finalizada" ? "pago" : "pendiente"}`}>{reserva.estado}</p>
                  </td>
                </tr>
              ))}

              {pageRows.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="empty">Sin resultados.</td>
                </tr>
              )}
            </tbody>
          </table>

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
      </div>

      <Footer />
    </>
  );
}

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
