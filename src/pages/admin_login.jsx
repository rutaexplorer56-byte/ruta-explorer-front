import { useState} from "react";
import '../styles/LoginModal.css';
import axios from "../axiosConfig";
import { useNavigate  ,Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function Login() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");

   const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/admin/login", {
        correo,
        contraseña,
      });

      // Puedes ajustar según lo que devuelva tu backend
      const { token,admin} = response.data;
      
      localStorage.setItem("nombre", admin.nombre);
      localStorage.setItem("token", token);


      toast.success("Iniciaste sesión");
    setTimeout(() => {
      navigate('/admin/tours'); // Cambia "/destino" por la ruta a donde quieras redirigir
    }, 3000);
     
      
      // Redirigir o cerrar modal si deseas
    } catch (error) {
        console.log(error)
      if (error.response && error.response.data) {
        
        toast.error("❌ Credenciales incorrectas. Inténtalo de nuevo.", {
        position: "top-right"
        });
      } else {
        toast.error("❌ Error al conectar con el servidor. Inténtalo de nuevo.", {
          position: "top-right"
        });
      }
      console.error("Error de login:", error);
    }
  };


  return (
    <div className="modal-overlay">
      <div className="modal-content-login">
        <img src="https://rutaxplorer.com/wp-content/uploads/2023/07/RUTA-XPLORER-2-03-1536x717.png"></img>
        <h2 className="modal-title-login">Iniciar Sesión</h2>
        <form onSubmit={handleLogin} className="modal-form">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            className="modal-input"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
            className="modal-input"
          />
          <button type="submit" className="modal-button">
            Iniciar Sesión
          </button>
          <p className="modal-hint">
            ¿Aún no tienes cuenta?{" "}
            <Link to="/registro" className="modal-link">
              Registrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
