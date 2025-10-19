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
  const [telefonoUsuario,setTelefonoUsuario]=useState('')
 
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
  const [adults, setAdults] = useState( 1);
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
const [selectedEscalon, setSelectedEscalon] = useState(null);
const [precioMostrar, setPrecioMostrar] = useState([]);
const [selectedPersonas, setSelectedPersonas] = useState("");

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await axios.get(`/api/tours/${id}`);
        setTour(res.data);
        setBasePrice(res.data.precio)
        setAdults(res.data.cantidadMinima ?? 1) // default
       

      
        
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
        amount: selectedEscalon || (basePrice * adults),
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
      
      

    }
  }, [tour]);
useEffect(() => {
  if (!tour) return;
  agregarHorasDesdeCadena(tour.salidas);
  agregarIncluidos(tour.incluido);
  agregarRecomendaciones(tour.recomendaciones);
    setPrecioMostrar(
          tour.tipo === "compartido"
            ? tour.precio
            : tour.precios?.length > 0
              ? Math.min(...tour.precios.map(p => p.precioPorPersona)) // el más barato
              : 0
         ) 
}, [tour]);



const handleAdultChange = (delta) => {
  setAdults((prev) => {
    const nuevaCantidad = prev + delta;

    // Si existe tour y tiene definida cantidadMinima, úsala, si no usa 1
    const min = tour?.cantidadMinima ?? 1;
    const max = tour?.cantidadMaxima ?? Infinity;

    if (nuevaCantidad < min) return min;
    if (nuevaCantidad > max) return max;

    return nuevaCantidad;
  });
};

  const verifyDate= async () => {
    const fecha = selectedDate.toISOString().split('T')[0];

    
    
    try{
      const res = await axios.get(`/api/reservas/fecha/${fecha}/${tour.id}/${selectedTime}`);
      
      
      if(res.data.fecha===selectedDate.toISOString().split('T')[0] && selectedTime===res.data.horario  && res.data.tourId===tour.id){
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

  const esCorreoValido = (correo) => {
    
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo);
  
  }; 
  if (!selectedTime) {
    toast.info("Por favor selecciona un horario disponible o cambia la fecha.");
    return;
  }
  if (!selectedDate || !selectedTime || !nombreUsuario || !correoUsuario  ) {
    toast.info("Por favor completa todos los campos antes de reservar.", {
            position: "top-right"
            });
            
    return;
  }
   if (!esCorreoValido(correoUsuario)) {
    toast.info("Por favor ingresa un correo válido.");
    return;
  }
  
  console.log("selectedEscalon", selectedEscalon);
  if(tour.tipo==="privado" && !selectedEscalon){
    toast.info("Por favor selecciona la cantidad de personas.", )
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
      telefono:telefonoUsuario,
      cantidadPersonas:  selectedPersonas || adults ,//esto
      valorTotal: basePrice*adults || selectedEscalon , //esto
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
const isToday = (d) => {
  if (!d) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

// "06:00 AM" | "6:00 pm" | "14:30"  ->  [hora24, minuto]
const to24 = (s = "") => {
  const str = s.trim();
  const m = str.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!m) return [0, 0];
  let [, hh, mm, ap] = m;
  let h = parseInt(hh, 10);
  const min = parseInt(mm, 10);
  if (ap) {
    const pm = ap.toUpperCase() === "PM";
    if (pm && h !== 12) h += 12;
    if (!pm && h === 12) h = 0; // 12 AM -> 00
  }
  return [h, min];
};
useEffect(() => {
  if (!selectedTime || !isToday(selectedDate)) return;
  const [h, m] = to24(selectedTime);
  const dt = new Date(selectedDate); dt.setHours(h, m, 0, 0);
  const cutoff = new Date(Date.now() + 2*60*60*1000);
  if (dt < cutoff) setSelectedTime("");
}, [selectedDate, selectedTime]);
  if (cargando) return <p>Cargando...</p>;

  return (
    
    <>
    <Header></Header>
      {!tour ?(<>
      <div className="tour-message">
        
        <h2>En el momento nos enconramos en mantenimiento...</h2>
        <h2> Si deseas reservar con nosotros te invitamos a escribirnos al siguiente numero:</h2>
        <h2 className='phone'>+57 3124151539</h2>
        <img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASYAAACrCAMAAAD8Q8FaAAABtlBMVEUordJCouT///8orNMfpclauPgGUoj///0DL1lCouZCouMorNSq2OZFpOn2///5//8DR3IAKFQ7caHq6OcbS4BSgac2dq5LqOgAMlzl8vgdfawALVoDSHFDkMwFS38AP3Tt//8UZo3L6PMAI1E+qMQffabQ9fkymL5YtM5Un9UAKFElirItsdPQ4fAANWAjU3UnaJhIjr8AG0q85+8AQG2s4OU/nOQqQ38AN2fj+/0gdZk2frE4j9Bwvs8AEUKQqLY2kuAwit4AVred4esmWYhdvfqDzN13ueJctvylz+crgt02n7s5ecQccNciedkAYr4yhMUNacKRs9cWTpwAXsgOMG6pxNJ1hJbT3+J4y92R4u+NytZ/1eTU/f5dvdGk6e9spLGBweYZO1tQmLSFustqtOew3fJopdO68vkukLRymspXkKoAMGS01e5EpLhnscObweRaiMR+ncEARLsyTWxuirR8m7sqb7xrmNAaW69LY4G9yOTg5/oAKqgAK5aVosBbfcIHP6YhaKQaXNAQU5NSYogcYaypwcuVnbMAJWVcbpEQVa0YS5FTZoszSHaD2PiB4/8AAEoPS7+dAAAfzElEQVR4nO2dj0Mad7LAYXcV2RVQmzMSlICssAgaEpAElZZfahUjIZomRqu11ySmjfnR1zuba/uul7ZJW728e//xm5nvd5cFFrVK0vSVScBlgXX3szPznZnv7GqzdaQjHelIRzrSkY50pCMd6UhHOtKRjnSkIx3pSEc60pGOdKQjHelIR84oosh//r678UeRDqajJa4Qo3iHU0sBixNFMW5T4vCjw+k4kUBsHU5HiCjZbOrdzc27kmiTfu+dObuI6ECYabTtrMPGyut3JUndlMp3y5J6d0tS2O/6f+LS23MQorh1d2trs7iblaSNqWJRzd7dsin8lPxBRVFQl0Q63e3CJG1qorQRnipubhanPn4iSdn1tm38dxHRFocnRbeJthwJ+O1ssXx3U5NItM3N8jYu/zGVifZZlGLBS8OpvuFL0zHFFo+f+VBEdNzZqXBRVcS4SJuT1GJyKnt3U0LDU1iADg9FpJFQYq5RacchvQGBuCauxIZTiZHova7z56MzpWvBCGrXWTjB0UvrWXX+4ywwESVV21JhQZHmP55X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'></img>



      </div>

      </> ):
      ( <div className="tour-page">
      <div className="tour-main">
        <div className='titulo_tour'><h1>{tour.nombre}</h1> <div className='precio'>${precioMostrar} COP</div></div>
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
            <div><i className="bi bi-person-dash"></i><p><strong>Cantidad Minima Personas:</strong><br />{tour.cantidadMinima}</p></div>
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
              // minDate={new Date(new Date().setDate(new Date().getDate() ))} 
              minDate={new Date()}

            />
          </div>
          <label>Horario</label>
          <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
            <option value="">Selecciona un horario</option>
            {/* {availableTimes.map((time, index) => (
              <option key={index} value={time}>{time}</option>
            ))} */}
              {(availableTimes || [])
                  .filter((t) => {
                    // fecha base: hoy si selectedDate es null
                    const baseDate = selectedDate || new Date();

                    // si NO es hoy, mostrar todos
                    const isToday =
                      baseDate.getFullYear() === (new Date()).getFullYear() &&
                      baseDate.getMonth() === (new Date()).getMonth() &&
                      baseDate.getDate() === (new Date()).getDate();

                    if (!isToday) return true;

                    // hoy: solo horarios >= ahora + 4h
                    const now = new Date();
                    const cutoff = new Date(now.getTime() + 4 * 60 * 60 * 1000);

                    // "06:00 AM" | "6:00 pm" | "14:30" -> [hora24, min]
                    const m = (t || "").trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
                    if (!m) return true; // si no matchea, no bloqueamos
                    let [, hh, mm, ap] = m;
                    let h = parseInt(hh, 10);
                    const min = parseInt(mm, 10);
                    if (ap) {
                      const pm = ap.toUpperCase() === "PM";
                      if (pm && h !== 12) h += 12;
                      if (!pm && h === 12) h = 0;
                    }

                    const dt = new Date(baseDate);
                    dt.setHours(h, min, 0, 0);
                    return dt >= cutoff;
                  })
                  .map((time, i) => (
                    <option key={i} value={time}>{time}</option>
                  ))
                }
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
          type="email"
          onChange={(e) => setCorreoUsuario(e.target.value)} required>
            
          </input>
          <label>Telefono:</label>
          <input placeholder='+(indicativo) - Telefono:'
          value={telefonoUsuario} 
          type='tel'
          onChange={(e) => setTelefonoUsuario(e.target.value)} required>
            
          </input>
          
          {/* Si el tour es compartido */}
          {tour.tipo === "compartido" && (
            <>
              <div className="adult-counter">
                <label>Personas:</label>
                <div>
                  <button onClick={() =>{ handleAdultChange(-1); console.log(amount)}}>-</button>
                  <span>{adults}</span>
                  <button
                    onClick={() => {handleAdultChange(1);  console.log(amount)}}
                    disabled={tour && adults >= tour.cantidadMaxima}
                  >
                    +
                  </button>
                </div>
              </div>
              <p className='precio'>
                <strong>Total:</strong>{" "}
                <span>${(basePrice * adults).toLocaleString("es-CO")}</span>
              </p>
            </>
          )}

          {/* Si el tour es privado */}
          {tour.tipo === "privado" && (
            <>
              <label>Selecciona número de personas:</label>
              <select
                value={selectedEscalon|| ""}
                onChange={(e) => {
                    
                      setSelectedEscalon(e.target.value); // guarda el precio total
                      setAmount(e.target.value);
                      setSelectedPersonas(e.target.options[e.target.selectedIndex].dataset.personas);
                      
                       // 👈 guarda personas
    }
                }
              >
                
                {Array.isArray(tour.precios) &&
                  tour.precios.map((p, idx) => (
                    <option
                      key={idx}
                      value={p.precioPorPersona * p.personas}
                      data-personas={p.personas} // 👈 usar dataset
                      
                    >
                      {p.personas} personas - ${p.precioPorPersona.toLocaleString("es-CO")} COP c/u
                    </option>
                  ))}
              </select>

              {selectedEscalon && (
                <p className="precio">
                  <strong>Total:</strong>{" "}
                  <span>${parseInt(selectedEscalon).toLocaleString("es-CO")}</span>
                </p>
              )}
            </>
          )}
         
          <div className='container_bold'>
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


