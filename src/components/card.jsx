import '../styles/card.css';
import AOS from 'aos';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ModalAgregarTour from './modal_tours';
import axios from "../axiosConfig";
import { toast } from 'react-toastify';
import { useTranslation } from "react-i18next";



// eslint-disable-next-line react/prop-types
const Card = ({ id,titulo, imagen, personasMax, horarios, duracion, precio,idioma,actualizarToursPadre,precios,tipo,activo,hotel,slug,onEdit}) => {
   const [modalAbierto, setModalAbierto] = useState(false);
   const [loadingDeleteId, setLoadingDeleteId] = useState(null);
   const { t } = useTranslation();
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
  // const [parametro, setParametro] = useState(" ");
  // const { parametros } = useParams();
    // const { hotel} = useParams();
  useEffect(() => {

    const token = localStorage.getItem('token');
    if (token) {
      setButtons(true);
    }
    // if(parametros){
    //   setHotel(parametros);
    // }
    // console.log("parametros en card:", parametros);
  }, []); 
   useEffect(() => {
  
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
    toast.success(" Tour eliminado exitosamente");
    setTimeout(() => {
      window.location.reload();
      actualizarToursPadre() // Cambia "/destino" por la ruta a donde quieras redirigir
    }, 3000); // 3000 milisegundos = 3 segundos
    
  } catch (error) {
    toast.error(" Error al eliminar el Tour. Inténtalo de nuevo.");
  }
};
const generarSlug = (texto) => {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};
    



  return (
    <>
    
    <div className="tour-card" data-aos="fade-up-right">
      <div className="tour-image">
        <div className='shadow'></div>
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
                <li>- {t("card.maxPersonas")}: {personasMax}</li>
                <li>- {t("card.horarios")}: {horarios}</li>
                <li>- {t("card.duracion")}: {duracion}</li>
                <li>- {t("card.idioma")}: {idioma}</li>
              </ul>

              <p className="price">
                {t("card.desde")}{" "}
                <strong>
                  {tipo === "compartido"
                    ? `$${Number(precio).toLocaleString("es-CO", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}`
                    : precios?.length > 0
                    ? `$${Number(precios[precios.length - 1].precioPorPersona).toLocaleString("es-CO", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}`
                    : "$0"}
                </strong>{" "}
                {t("card.moneda")}
                <small>({t("card.precioVariable")})</small>
              </p>

              <div className="buttons-container">
                {!buttons ? (
                  <Link
                    className="reserve-button"
                    to={`/tour/${hotel || "RutaExplorer"}/${slug}`}
                  >
                    <button className="reserve-button">
                      {t("card.reservar")}
                    </button>
                  </Link>
  
            
          ):(
            <>
            <button className='edit' onClick={() => onEdit?.(id)}><i className="bi bi-pencil-square"></i></button>
            
            <button className='view' ><Link  to={`/tour/${slug}`}><i className="bi bi-eye"></i> </Link></button>
           
            <button className='delete' onClick={()=>{eliminarTour(id)}}><i className="bi bi-trash"></i></button>

            </>
          )

          }
          

        </div>
        
      </div>
    </div>
    {/* <ModalAgregarTour isOpen={modalAbierto}  onClose={modalAbierto} id={id}></ModalAgregarTour> */}
    </>
  );
};

export default Card;