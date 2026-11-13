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
    nombrePersona: "",
    cantidadPersonas: "",
    valorTotal: ""
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
        nombrePersona: reservaData?.nombrePersona || "",
        cantidadPersonas: reservaData?.cantidadPersonas ?? "",
        valorTotal: reservaData?.valorTotal ?? ""
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

    const cantidad = Number(form.cantidadPersonas);
    const total = Number(form.valorTotal);
    const maximo = Number(tour?.cantidadMaxima);
    if (String(form.cantidadPersonas).trim() === '' || !Number.isSafeInteger(cantidad) || cantidad < 1 || cantidad > 2147483647 ||
        (Number.isInteger(maximo) && maximo > 0 && cantidad > maximo)) {
      setError('Ingresa una cantidad entera válida, desde 1 y dentro de la capacidad máxima del tour.');
      return;
    }
    if (String(form.valorTotal).trim() === '' || !Number.isSafeInteger(total) || total < 0 || total > 2147483647) {
      setError('Ingresa un valor total entero, no negativo y máximo de 2147483647 COP.');
      return;
    }

    const payload = {
      fecha: form.fecha,
      horario: form.horario,
      idioma: form.idioma,
      telefono: form.telefono.trim(),
      nombrePersona: form.nombrePersona.trim(),
      cantidadPersonas: cantidad,
      valorTotal: total,
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
      onClose();
      
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
            Edita los datos de la reserva, la cantidad de personas y el valor total.
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
              <label className="er-label" htmlFor="editar-cantidad">Cantidad de personas</label>
              <input id="editar-cantidad" className="er-input" type="number" name="cantidadPersonas"
                min="1" max={Number(tour?.cantidadMaxima) > 0 ? tour.cantidadMaxima : 2147483647} step="1"
                value={form.cantidadPersonas} onChange={onChange} required />
            </div>
            <div className="er-field">
              <label className="er-label" htmlFor="editar-total">Valor total (COP)</label>
              <input id="editar-total" className="er-input" type="number" name="valorTotal"
                min="0" max="2147483647" step="1" value={form.valorTotal} onChange={onChange} required />
              <small className="er-help">El valor total se edita manualmente; cambiar la cantidad no lo recalcula.</small>
            </div>
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
            <button className="er-btn er-primary" type="submit" disabled={saving}>
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
