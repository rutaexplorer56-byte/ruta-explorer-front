import  { useState } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import es from 'date-fns/locale/es';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import '../styles/tour.css';
import Header from '../components/header';
import Footer from '../components/footer';
import AOS from 'aos';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from "../axiosConfig";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import BotonBold from "../components/BotonBold";


registerLocale('es', es);

const Tour = () => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [correoUsuario, setCorreoUsuario] = useState('');
 
  const [admin,setAdmin]=useState(false)
       const { t } = useTranslation();
      useEffect(() => {
      AOS.init({
        duration: 1000, // duración de la animación
        once: true,     // solo una vez al entrar al viewport
      });
      if(localStorage.getItem('token')){
        setAdmin(true)
      }
      const api =import.meta.env.VITE_BOLD_PUBLIC_KEY;
      setApiKey(api)
      
     
    }, []);
   


  const { id } = useParams();
  const { hotel } = useParams();
  const [tour, setTour] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [fotos,setFotos]= useState("https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/4a/e8/a0/20190709-093333-largejpg.jpg?w=1200&h=1200&s=1")
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [adults, setAdults] = useState(1);
  const [mainImage, setMainImage] = useState(fotos);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [incluidos,setIncluidos]=useState([]);
  const[recomendaciones,setRecomendaciones]=useState([])
  const [basePrice,setBasePrice]=useState(0);
  const [firmaBold, setFirmaBold] = useState(null);
  const [referencia,setReferencia]=useState('')
  const [currency,setCurrency]=useState('COP')
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_BOLD_PUBLIC_KEY);
  const[amount,setAmount]=useState(0)


  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await axios.get(`/api/tours/${id}`);
        setTour(res.data);
        setBasePrice(res.data.precio)
        
      } catch (error) {
        console.error('Error al obtener tour:', error);
      } finally {
        setCargando(false);
      }
    };

    fetchTour();
    
  }, [id]);

  const obtenerFirma = async (data) => {
    try {
      
        const response = await axios.post("/api/firma-bold", {
        reference: data.reserva.referenciaPago,
        amount: basePrice * adults,
        currency: "COP",
      });
      setFirmaBold(response.data.signature);
      setReferencia(data.reserva.referenciaPago)
      setFirmaBold(response.data.signature)
      setAmount(data.reserva.valorTotal)
      setCurrency('COP')
      
    } catch (error) {
      console.error("Error al obtener la firma de Bold:", error);
    }
  };

  

  function agregarHorasDesdeCadena(cadena) {
  const nuevasHoras = cadena
    .split('/')                    // separa por coma
    .map(hora => hora.trim())     // quita espacios extra
    .filter(hora => hora !== ''); // elimina vacíos

   setAvailableTimes(nuevasHoras)
}
function agregarIncluidos(cadena){
  const nuevosIncluidos = cadena
    .split(',')                    // separa por coma
    .map(hora => hora.trim())     // quita espacios extra
    .filter(hora => hora !== '');
    
  setIncluidos(nuevosIncluidos)
}
function agregarRecomendaciones(cadena){
  const nuevosRecomendaciones = cadena
    .split(',')                    // separa por coma
    .map(hora => hora.trim())     // quita espacios extra
    .filter(hora => hora !== '');
    
  setRecomendaciones(nuevosRecomendaciones)
}

  useEffect(() => {
    if (tour && tour.fotos && tour.fotos.length > 0) {
      
      setFotos(tour.fotos);
      setMainImage(tour.fotos[0]);
      agregarHorasDesdeCadena(tour.salidas)
      agregarIncluidos(tour.incluido)
      agregarRecomendaciones(tour.recomendaciones)

    }
  }, [tour]);




  const handleAdultChange = (delta) => {
  setAdults((prev) => {
    const nuevaCantidad = prev + delta;

    // Límite mínimo 1
    if (nuevaCantidad < 1) return 1;

    // Límite máximo según tour
    if (tour && nuevaCantidad > tour.cantidadMaxima) {
      return tour.cantidadMaxima;
    }

    return nuevaCantidad;
  });
};

  const verifyDate= async () => {
    try{
      const res = await axios.get(`/api/reservas/fecha/${selectedDate.toISOString().split('T')[0]}`);
 

      if(res.data.fecha===selectedDate.toISOString().split('T')[0] && selectedTime===res.data.horario){
        toast.warn("ya hay una reserva para esta fecha u horario, por favor cambialo...", {
        position: "top-right",
        autoClose: 4300,
      });
      return false;
        
      }
      return true;
      


    }
    catch(error){
      return true;

    }
  }


  


 const handleReserva = async () => {
  if (!selectedDate || !selectedTime || !nombreUsuario || !correoUsuario) {
    toast.info("Por favor completa todos los campos antes de reservar.", {
            position: "top-right"
            });
    return;
  }
  const isValid = await verifyDate();
  if (!isValid) return; // Evita ejecutar lo demás

  try {
   
    const response = await axios.post("/api/reservas", {
      nombreTour:tour.nombre,
      fecha: selectedDate.toISOString().split('T')[0],
      horario:selectedTime,
      nombrePersona: nombreUsuario,
      correo: correoUsuario,
      cantidadPersonas: adults,
      valorTotal: basePrice * adults,
      tourId: tour.id,
      hotel:hotel
    });

   if (response.status === 201 || response.status === 200) {
      

      toast.info("Reserva creada, creando el boton de pago...", {
        position: "top-right"
      });
      obtenerFirma(response.data)

    
    }
    
  } catch (error) {
    console.error("❌ Error al reservar:", error);
     toast.error(" ❌ Error al reservar:.", {
            position: "top-right"
            });
  }
};
  if (cargando) return <p>Cargando...</p>;

  return (
    
    <>
    <Header></Header>
      {!tour ?(<h2>Todavia no hay tours para mostrar.</h2>):
      ( <div className="tour-page">
      <div className="tour-main">
        <div className='titulo_tour'><h1>{tour.nombre}</h1> <div className='precio'>${tour.precio} COP</div></div>
        <div className="tour-gallery"  data-aos="fade-down">
          <Zoom>
            <img className="main-image" src={mainImage} alt="Tour principal" />
          </Zoom>
          <div className="thumbnail-row">
            {Array.isArray(fotos) && fotos.length > 0 ? (
                fotos.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`Thumbnail ${index + 1}`}
                    className={mainImage === src ? 'thumbnail selected' : 'thumbnail'}
                    onClick={() => setMainImage(src)}
                  />
                ))
              ) : (
                <p>No hay imágenes disponibles</p>
              )}
          </div>
        </div>

        <div className="tour-info-block" data-aos="fade-up-right">
          <div className="tour-icons">
            <div><i className="bi bi-alarm"></i><p><strong>Tiempo:</strong><br />{tour.tiempo}</p></div>
            <div><i className="bi bi-calendar-date"></i><p><strong>Tours al día:</strong><br />{tour.toursPorDia}</p></div>
            <div><i className="bi bi-clipboard2-check"></i><p><strong>Horarios:</strong><br />{tour.salidas}</p></div>
            <div><i className="bi bi-translate"></i><p><strong>Idioma:</strong><br />{tour.idioma}</p></div>
          </div>
           <h2>Incluido:</h2>
          <ul className="lista_incluidos">
            {incluidos.length > 0 &&
              incluidos.map((incluido, index) => (
                <li key={index}>
                  <i className="bi bi-check-circle"></i> {incluido}
                </li>
              ))
            }
            
            
          </ul>
          <h2>Recomendaciones:</h2>
          <ul className="lista_recomendaciones">
            {recomendaciones.length > 0 &&
              recomendaciones.map((incluido, index) => (
                <li key={index}>
                  <i className="bi bi-info-circle"></i> {incluido}
                </li>
              ))
            }           
          </ul>



          
          <div className='container_descripcion' data-aos="fade-left">
            <h2>{t('acerca_titulo')}</h2>
            <p className='descripcion_tour'>
                {tour.descripcion}
            </p>
            

          </div>
          
            
 
        </div>
      </div>

      <div className="tour-sidebar" data-aos="fade-up-left">
        <div className="tour-reservation">
            <p className='titulo_calendario'>Reserva</p>
          <label>Fecha:</label>
          <div className="calendar-overlay">
            <DatePicker 
              inline
              locale="es"
              selected={selectedDate} 
              onChange={(date) => setSelectedDate(date)} 
              dateFormat="dd/MM/yyyy"
              minDate={new Date(new Date().setDate(new Date().getDate() + 1))} 

            />
          </div>
          <label>Horario</label>
          <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
            <option value="">Selecciona un horario</option>
            {availableTimes.map((time, index) => (
              <option key={index} value={time}>{time}</option>
            ))}
          </select>
          <label>Tu nombre:</label>
          <input 
           placeholder='Nombre:' 
            value={nombreUsuario} 
            onChange={(e) => setNombreUsuario(e.target.value)}>
          </input>
          <label>Correo:</label>
          <input placeholder='Correo:'
          value={correoUsuario} 
          onChange={(e) => setCorreoUsuario(e.target.value)}>
          </input>
          
          <div className="adult-counter">
            <label>Personas:</label>
            <div>
              <button onClick={() => handleAdultChange(-1)}>-</button>
              <span>{adults}</span>
              <button onClick={() => handleAdultChange(1)} disabled={tour && adults >= tour.cantidadMaxima}>+</button>
            </div>
          </div>
          <p className='precio'><strong>Total:</strong> <span>${ (basePrice * adults).toLocaleString('es-CO') }</span></p>
          {!firmaBold && (<button  className={`reserve-btn ${admin ? "disable" : ""}`} disabled={admin} onClick={handleReserva}>Reservar ahora</button>)}
          {firmaBold &&(
            <BotonBold
              reference={referencia}
              amount={amount}
              currency={currency}
              api={apiKey}
              signature={firmaBold}
            />
          )}
          
         
        </div>
      </div>
    </div>)
    }
   
            

      
     <div className="container_logos">
                <img className="img_logo" src="https://rutaxplorer.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-26-at-14.28.24.jpeg"></img>
                <img className="img_logo" src="https://rutaxplorer.com/wp-content/uploads/2023/08/logo_camara.jpeg"></img>
                <img className="img_logo" src="https://rutaxplorer.com/wp-content/uploads/2023/08/RNT.jpeg"></img>
                <img className="img_logo" src="https://rutaxplorer.com/wp-content/uploads/2023/08/logo_fontur.png"></img>
                <img className="img_logo" src="https://rutaxplorer.com/wp-content/uploads/2023/07/Tripadvisor_Logo_circle-green_vertical-lockup_registered_CMYK-1024x475.png"></img>
        </div>
        
    <Footer>

    </Footer>
    
    </>
  );
};

export default Tour;


