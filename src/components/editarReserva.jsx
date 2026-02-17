import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/EditarReserva.css";
import axios from "../axiosConfig";
import { toast } from 'react-toastify';



const todayISO = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function EditarReserva({onClose,id}) {
  
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [reserva, setReserva] = useState(null);
  const [tour, setTour] = useState(null);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [idiomasDisponibles, setIdiomasDisponibles] = useState([]);

  const [form, setForm] = useState({
    fecha: "",
    horario: "",
    idioma: "",
    telefono: "",
    nombrePersona: ""
  });

  function parseLista(cadena) {
  if (!cadena) return [];
  if (Array.isArray(cadena)) return cadena.map(x => String(x).trim()).filter(Boolean);

  return String(cadena)
    .split(/[\/,]/)          // separa por "/" o ","
    .map(v => v.trim())
    .filter(Boolean);
}


useEffect(() => {
  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");

      // 1️⃣ Traer reserva
      const { data: reservaResponse } = await axios.get(`/api/reservas/${id}`);
      const reservaData = reservaResponse.reserva || reservaResponse;
      setReserva(reservaData);

      // 2️⃣ Traer tour usando el tourId
      const { data: tourResponse } = await axios.get(
        `/api/tours/${reservaData.tourId}`
      );
        

      


      // 3️⃣ Prellenar formulario
      setForm({
        fecha: reservaData?.fecha || "",
        horario: reservaData?.horario || "",
        idioma: reservaData?.idioma || "",
        telefono: reservaData?.telefono || "",
        nombrePersona: reservaData?.nombrePersona || ""
      });
      setTour(tourResponse);
      setHorariosDisponibles(parseLista(tourResponse.salidas));
      setIdiomasDisponibles(parseLista(tourResponse.idioma));
     

    } catch (error) {
      console.error("Error cargando datos:", error);
      setError("No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  fetchAll();
}, [id]);




  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

const onSubmit = async (e) => {
  e.preventDefault();

  if (saving) return; // evita doble submit
  try {
    setSaving(true);
    setError("");

    const payload = {
      fecha: form.fecha,
      horario: form.horario,
      idioma: form.idioma,
      telefono: form.telefono.trim(),
      nombrePersona: form.nombrePersona.trim(),
    };

    const token = localStorage.getItem("token");

    const response = await axios.patch(`/api/reservas/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      // si usas toast:
      toast.success("Reserva actualizada exitosamente");
      
    } else {
      setError("No se pudo actualizar la reserva");
       toast.error("No se pudo actualizar la reserva");
    }

  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.mensaje ||
      "Error al actualizar la reserva";
    setError(msg);
    // o toast.error(msg);
  } finally {
    setSaving(false);
  }
};


  if (loading) {
    return <div className="er-wrap"><div className="er-card">Cargando...</div></div>;
  }

  return (
    <div className="er-wrap">
      <div className="er-card">
        <div className="er-header">
          <h2 className="er-title">Editar reserva</h2>
          <p className="er-subtitle">
            Solo se actualiza: fecha, horario, idioma, teléfono y nombre.
          </p>
        </div>

        {error ? <div className="er-alert">{error}</div> : null}

        <div className="er-info">
          <div className="er-info-row">
            <span className="er-info-label">Tour:</span>
            <span className="er-info-value">{reserva?.nombreTour || tour?.nombre || "—"}</span>
          </div>
          <div className="er-info-row">
            <span className="er-info-label">Correo:</span>
            <span className="er-info-value">{reserva?.correo || "—"}</span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="er-form">
          <div className="er-grid">
            <div className="er-field">
              <label className="er-label">Nombre</label>
              <input
                className="er-input"
                name="nombrePersona"
                value={form.nombrePersona}
                onChange={onChange}
                required
                placeholder="Ej: Andrés Parra"
              />
            </div>

            <div className="er-field">
              <label className="er-label">Teléfono</label>
              <input
                className="er-input"
                name="telefono"
                value={form.telefono}
                onChange={onChange}
                required
                placeholder="Ej: 3100000000"
              />
            </div>

            <div className="er-field">
              <label className="er-label">Fecha</label>
              <input
                className="er-input"
                type="date"
                name="fecha"
                value={form.fecha}
                min={todayISO()}
                onChange={onChange}
                required
              />
              <small className="er-help">No se permiten fechas anteriores a hoy.</small>
            </div>

            <div className="er-field">
              <label className="er-label">Horario</label>
              <select
                className="er-input"
                name="horario"
                value={form.horario}
                onChange={onChange}
                required
              >
                
                {horariosDisponibles.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              {!horariosDisponibles.length ? (
                <small className="er-help er-warn">
                  No encontré horarios en el tour. Revisa el campo <b>tour.horarios</b>.
                </small>
              ) : null}
            </div>

            <div className="er-field">
              <label className="er-label">Idioma</label>
              <select
                className="er-input"
                name="idioma"
                value={form.idioma}
                onChange={onChange}
                required
              >
                
                {idiomasDisponibles.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
              {!idiomasDisponibles.length ? (
                <small className="er-help er-warn">
                  No encontré idiomas en el tour. Revisa el campo <b>tour.idiomas</b>.
                </small>
              ) : null}
            </div>
          </div>

          <div className="er-actions">
            <button className="er-btn er-primary" type="submit" disabled={saving} onClick={()=>setTimeout(()=>onClose(), 3000) }>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>

            <button
              className="er-btn er-ghost"
              type="button"
             onClick={()=>onClose() }
              disabled={saving}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
