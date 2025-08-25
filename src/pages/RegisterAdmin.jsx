import { useState } from "react";
import "../styles/LoginModal.css"; // reutilizamos mismos estilos
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function RegisterAdmin() {
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    contraseña: "",
    confirmar: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validar = () => {
    if (!form.nombre.trim()) return "El nombre es obligatorio.";
    if (!/^\S+@\S+\.\S+$/.test(form.correo)) return "Correo inválido.";
    if (form.contraseña.length < 6)
      return "La contraseña debe tener al menos 6 caracteres.";
    if ("rutadmin"!== form.confirmar)
      return "La clave de registro no es correcta.";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validar();
    if (err) {
      toast.info(`⚠️ ${err}`, { position: "top-right" });
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        "/api/admin/register",
        {
          nombre: form.nombre.trim(),
          correo: form.correo.trim(),
          contraseña: form.contraseña,
        }
      );

      // si tu backend retorna token y admin, guárdalos (opcional)
      if (data?.token && data?.admin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("nombre", data.admin.nombre);
      }

      toast.success("✅ Administrador registrado correctamente", {
        position: "top-right",
      });
      setTimeout(() => navigate("/admin/tours"), 2000);
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Error al registrar el administrador.";
      toast.error(`❌ ${msg}`, { position: "top-right" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-login">
        <img
          src="https://rutaxplorer.com/wp-content/uploads/2023/07/RUTA-XPLORER-2-03-1536x717.png"
          alt="RutaXplorer"
        />
        <h2 className="modal-title-login">Registrar Administrador</h2>

        <form className="modal-form" onSubmit={onSubmit}>
          <input
            className="modal-input"
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={onChange}
            required
          />
          <input
            className="modal-input"
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            value={form.correo}
            onChange={onChange}
            required
          />
          <input
            className="modal-input"
            type="password"
            name="contraseña"
            placeholder="Contraseña"
            value={form.contraseña}
            onChange={onChange}
            required
          />
          <input
            className="modal-input"
            type="password"
            name="confirmar"
            placeholder="Clave de Registro"
            value={form.confirmar}
            onChange={onChange}
            required
          />

          <button className="modal-button" type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear cuenta"}
          </button>

          <p className="modal-hint">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="modal-link">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
