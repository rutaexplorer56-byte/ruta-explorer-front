import '../styles/card.css';
// import AOS from 'aos';
import { useEffect, useState } from 'react';
import TourLink from './TourLink';
import ModalAgregarTour from './modal_tours';
import axios from "../axiosConfig";
import { toast } from 'react-toastify';
import { useTranslation } from "react-i18next";

import { optimizarImagenCloudinary } from "../utils/cloudinary";
import PrecioPromocion from './PrecioPromocion';
import { promocionVisible } from '../utils/promociones';
import useFechaPromocion from '../hooks/useFechaPromocion';
import { numero, tarifasValidas } from '../utils/datosApi';

/* eslint-disable react/prop-types */
const Card = ({ id,titulo, imagen, personasMax, horarios, duracion, precio,idioma,actualizarToursPadre,precios,tipo,activo,hotel,slug,onEdit,promocion}) => {
   const hoyPromocion = useFechaPromocion();
   const tienePromocion = promocionVisible(promocion, hoyPromocion);
   const [modalAbierto, setModalAbierto] = useState(false);
   const [loadingDeleteId, setLoadingDeleteId] = useState(null);
   const { t } = useTranslation();
   const precioNormal = tipo === 'compartido' ? numero(precio) : tarifasValidas(precios).reduce(
     (minimo, tarifa) => minimo === null ? numero(tarifa.precioPorPersona) : Math.min(minimo, numero(tarifa.precioPorPersona)),
     null
   );

//   useEffect(() => {
//   AOS.init({
//     duration: 1000, // duración de la animación
//     once: true,     // solo una vez al entrar al viewport
//   });
// }, []);
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
    <div className="tour-card-list" >
      <div className="tour-card-img">
        <img
          src={optimizarImagenCloudinary(imagen, 800)}
          srcSet={`
            ${optimizarImagenCloudinary(imagen, 400)} 400w,
            ${optimizarImagenCloudinary(imagen, 800)} 800w,
            ${optimizarImagenCloudinary(imagen, 1200)} 1200w
          `}
          sizes="(max-width: 768px) 100vw, 320px"
          alt={titulo}
          loading="lazy"
          decoding="async"
        />

        
      </div>

      <div className="tour-card-info">
        {buttons && (
          <div
            className={`estado-toggle ${activoLocal ? "finalizada" : "inactivo"}`}
            onClick={toggleActivo}
            title={activoLocal ? "Activo" : "Inactivo"}
            role="button"
            aria-label="Cambiar estado del tour"
            style={{
              opacity: saving ? 0.6 : 1,
              pointerEvents: saving ? "none" : "auto",
            }}
          ></div>
        )}

        <h3>{titulo}</h3>

        <div className="tour-meta">
          <span>
            <i className="bi bi-clock"></i>
            {duracion}
          </span>

          {horarios && (
            <span>
              <i className="bi bi-calendar-event"></i>
              {horarios}
            </span>
          )}

          {idioma && (
            <span>
              <i className="bi bi-translate"></i>
              {idioma}
            </span>
          )}
        </div>
        <p className="tour-card-price-notice">{t('card.precioVariable')}</p>
      </div>

      <div className="tour-card-price">
        <span className="price-label">{t("card.desde")}</span>

        {!(precioNormal > 0) ? <strong>{t('datosApi.precioPendiente')}</strong> : tienePromocion ? (
          <PrecioPromocion
            precioNormal={precioNormal}
            precioPromocion={promocion.precioPromocion}
            tipo={tipo}
          />
        ) : <>
        <strong>
          {`$${Number(precioNormal).toLocaleString('es-CO')}`}
        </strong>

        <small>COP</small>
        <span className="price-persona">por persona</span>
        </>}

        <div className="buttons-container-list">
          {!buttons ? (
            <TourLink
              className="details-link"
              slug={slug} referral={hotel}
            >
              VER DETALLES
            </TourLink>
          ) : (
            <div className="admin-card-actions">
              <button className="edit" onClick={() => onEdit?.(id)}>
                <i className="bi bi-pencil-square"></i>
              </button>

              <TourLink className="view" slug={slug}>
                <i className="bi bi-eye"></i>
              </TourLink>

              <button className="delete" onClick={() => eliminarTour(id)}>
                <i className="bi bi-trash"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
);
};

export default Card;
