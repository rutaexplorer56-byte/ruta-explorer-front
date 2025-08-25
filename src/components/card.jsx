import '../styles/card.css';
import AOS from 'aos';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ModalAgregarTour from './modal_tours';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';


// eslint-disable-next-line react/prop-types
const Card = ({ id,titulo, imagen, personasMax, horarios, duracion, precio,idioma,actualizarToursPadre }) => {
   const [modalAbierto, setModalAbierto] = useState(false);
  useEffect(() => {
  AOS.init({
    duration: 1000, // duración de la animación
    once: true,     // solo una vez al entrar al viewport
  });
}, []);
const [buttons,setButtons]=useState(false)
  const { hotel } = useParams();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setButtons(true);
    }
  }, []); 

 const eliminarTour = async (id) => {

  try {
    const token = localStorage.getItem('token');
    await axios.delete(`/api/tours/${id}`, {
      headers: {
        Authorization: `Bearer ${token}` // token debe ser tu JWT
      }
    });
    toast.success("✅ Tour eliminado exitosamente");
    actualizarToursPadre()
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
        <h3>{titulo}</h3>
        <ul className="tour-info">
          <li>- Cantidad máxima de personas:{personasMax}</li>
          <li>- Horarios: {horarios}</li>
          <li>- Duración: {duracion}</li>
          <li>- Idioma: {idioma}</li>
        </ul>
        <p className="price">
          a partir de <strong>${precio}</strong> (x) persona
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