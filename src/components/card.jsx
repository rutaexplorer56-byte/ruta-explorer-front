import '../styles/card.css';
import AOS from 'aos';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ModalAgregarTour from './modal_tours';
import axios from "../axiosConfig";
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';


// eslint-disable-next-line react/prop-types
const Card = ({ id,titulo, imagen, personasMax, horarios, duracion, precio,idioma,actualizarToursPadre,precios,tipo,activo,}) => {
   const [modalAbierto, setModalAbierto] = useState(false);
  useEffect(() => {
  AOS.init({
    duration: 1000, // duración de la animación
    once: true,     // solo una vez al entrar al viewport
  });
}, []);
const [buttons,setButtons]=useState(false)
  // 👇 estado local para el activo/inactivo y “guardando”
  const [activoLocal, setActivoLocal] = useState(!!activo);
  const [saving, setSaving] = useState(false);
  const { hotel } = useParams();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setButtons(true);
    }
  }, []); 
   useEffect(() => {
    console.log("activo prop cambiado:", activo);
    setActivoLocal(!!activo); // si cambia desde arriba, sincroniza
  }, [activo, id]);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    const token = localStorage.getItem('token');
    if (token) setButtons(true);
  }, []);

  const toggleActivo = async () => {
    if (saving) return;
    const next = !activoLocal;
    setActivoLocal(next);          // optimista
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/tours/${id}`, { activo: next }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Tour ${next ? 'activado' : 'desactivado'} `);
      if (typeof actualizarToursPadre === 'function') actualizarToursPadre();
    } catch (err) {
      setActivoLocal(!next);       // revert
      toast.error('No se pudo cambiar el estado 😕');
    } finally {
      setSaving(false);
    }
  };

 const eliminarTour = async (id) => {

  try {
    const token = localStorage.getItem('token');
    await axios.delete(`/api/tours/${id}`, {
      headers: {
        Authorization: `Bearer ${token}` // token debe ser tu JWT
      }
    });
    toast.success("✅ Tour eliminado exitosamente");
    setTimeout(() => {
      window.location.reload();
      actualizarToursPadre() // Cambia "/destino" por la ruta a donde quieras redirigir
    }, 3000); // 3000 milisegundos = 3 segundos
    
  } catch (error) {
    toast.error("❌ Error al eliminar el Tour. Inténtalo de nuevo.");
  }
};

    



  return (
    <>
    
    <div className="tour-card" data-aos="fade-up-right">
      <div className="tour-image">
        <img src={imagen} alt={titulo} />
      </div>
      <div className="tour-details">
        {buttons ?(
         <div
              className={`estado-toggle ${activoLocal ? 'finalizada' : 'inactivo'}`}
              onClick={toggleActivo}
              title={activoLocal ? 'Activo' : 'Inactivo'}
              role="button"
              aria-label="Cambiar estado del tour"
              style={{ opacity: saving ? 0.6 : 1, pointerEvents: saving ? 'none' : 'auto' }}
            ></div>
            ):(<></>)

            }
       
           
        <h3>{titulo}</h3>
        <ul className="tour-info">
          <li>- Cantidad máxima de personas:{personasMax}</li>
          <li>- Horarios: {horarios}</li>
          <li>- Duración: {duracion}</li>
          <li>- Idioma: {idioma}</li>
        </ul>
        <p className="price">
              a partir de{" "}
              <strong>
                {tipo === "compartido"
                  ? `$${precio?.toLocaleString("es-CO")}`
                  : precios?.length > 0
                    ? `$${precios[0].precioPorPersona.toLocaleString("es-CO")}`
                    : "$0"}
              </strong>{" "}
              (x) persona
            </p>
        <div className='buttons-container'>
          {!buttons ? (
             <Link className="reserve-button" to={`/tour/${hotel}/${id}`}>
              <button className="reserve-button" >Reservar</button>
              </Link>
            
          ):(
            <>
            <button className='edit' onClick={setModalAbierto}><i className="bi bi-pencil-square"></i></button>
            
            <button className='view' ><Link  to={`/tour/${id}`}><i className="bi bi-eye"></i> </Link></button>
           
            <button className='delete' onClick={()=>{eliminarTour(id)}}><i className="bi bi-x-lg"></i></button>

            </>
          )

          }
          

        </div>
        
      </div>
    </div>
    <ModalAgregarTour isOpen={modalAbierto}  onClose={() => setModalAbierto(false)} id={id}></ModalAgregarTour>
    </>
  );
};

export default Card;