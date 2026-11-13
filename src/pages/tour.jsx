import MetodoPago from '../components/MetodoPago';
import ReservaManual from '../components/ReservaManual';
import { diasBloqueados } from '../utils/diasBloqueados';
import { cotizarPago, metodosPermitidos } from '../utils/pagos';
import  { useState,useMemo } from 'react'
import CalendarioReservas from '../components/CalendarioReservas';
import GaleriaTour from '../components/GaleriaTour';
import '../styles/tour.css';
import Header from '../components/header';
import Footer from '../components/footer';
import AOS from 'aos';
import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { normalizeRef, validTourSlug, getTourPublicPath, getReservationHotel, withReferral } from '../utils/tourUrls';
import { reservaHabilitada, tarifasValidas } from '../utils/datosApi';
import axios from "../axiosConfig";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import BotonBold from "../components/BotonBold";
import Terminos from '../components/Terminos';
import { abrirBoldCheckout } from "../utils/boldCheckout";
import Seo from "../components/Seo";
import { tourSeoDescription } from '../utils/seoLanguages';
import { precioAplicableExtra, detalleExtras } from "../utils/extras";
import { aplicaPromocion, promocionVisible, precioAplicableTour } from '../utils/promociones';
import useFechaPromocion from '../hooks/useFechaPromocion';
import PrecioPromocion from '../components/PrecioPromocion';
import ItinerarioTour from '../components/ItinerarioTour';


const Tour = () => {
  const hoyPromocion = useFechaPromocion();
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [correoUsuario, setCorreoUsuario] = useState('');
  const [telefonoUsuario,setTelefonoUsuario]=useState('')
 
  const [admin,setAdmin]=useState(false)
         const { i18n } = useTranslation();
  const { t } = useTranslation();
  const lang = (i18n.language || "es").split("-")[0];
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
   



  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const hotel = normalizeRef(searchParams.get('ref'));
  const [recepcionista,setRecepcionista]=useState('') 
  const [tour, setTour] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [adults, setAdults] = useState( 1);
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
  const [precioMostrar, setPrecioMostrar] = useState(null);
  const [selectedPersonas, setSelectedPersonas] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [idioma, setIdioma] = useState("");
  const[activo,setActivo]=useState(false)
  const [horariosConReserva, setHorariosConReserva] = useState(new Set());
  const [consultaReservasClave, setConsultaReservasClave] = useState('');
  const [extrasSeleccionados, setExtrasSeleccionados] = useState({});
  const [tipoDocumento, setTipoDocumento] = useState("cedula");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [hotelCliente, setHotelCliente] = useState("");
  const [pais, setPais] = useState("");
  const [metodoPago, setMetodoPago] = useState("bold");
  const [creandoReserva, setCreandoReserva] = useState(false);
  const [reservaManual, setReservaManual] = useState(null);
  // Abrir modal
  const abrirModal = () => setIsModalOpen(true);

  // Cerrar modal
  const cerrarModal = () => setIsModalOpen(false);


useEffect(() => {
const controller = new AbortController();
const fetchTour = async () => {
  setCargando(true);
  setErrorCarga(false);
  setSelectedDate(null);
  setSelectedTime('');
  setSelectedPersonas('');
  setSelectedEscalon(null);
  setIdioma('');
  setExtrasSeleccionados({});
      try {
        if (!validTourSlug(slug)) throw new Error('Slug de tour inválido');
        
        const res = await axios.get(`/api/tours/nombre/${encodeURIComponent(slug)}`, { signal: controller.signal, params: { lang } });
        if (controller.signal.aborted) return;
        
        setTour(res.data);
        setMetodoPago(prev => metodosPermitidos(res.data.metodosPago).includes(prev) ? prev : metodosPermitidos(res.data.metodosPago)[0] || '');
        setBasePrice(res.data.precio)
        setAdults(res.data.cantidadMinima ?? 1) // default
        
       

      
        
      } catch (error) {
        if (controller.signal.aborted) return;
        setTour(null);
        setErrorCarga(true);
        console.error('Error al obtener tour:', error);
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    };

    fetchTour();
    return () => controller.abort();
    
  }, [lang,slug]);
  


  
  // const obtenerFirma = async (data) => {
  //   try {
      
  //       const response = await axios.post("/api/firma-bold", {
  //       reference: data.reserva.referenciaPago,
  //       amount: selectedEscalon || (basePrice * adults),
  //       currency: "COP",
  //     });
  //     setFirmaBold(response.data.signature);
  //     setReferencia(data.reserva.referenciaPago)
  //     setFirmaBold(response.data.signature)
  //     setAmount(data.reserva.valorTotal)
  //     setCurrency('COP')
      
  //   } catch (error) {
  //     console.error("Error al obtener la firma de Bold:", error);
  //   }
  // };

  const obtenerFirma = async (data) => {
  try {
    const reserva = data.reserva;

    const response = await axios.post("/api/firma-bold", {
      reference: reserva.referenciaPago,
      amount: reserva.valorTotal,
      currency: "COP",
    });

    const signature = response.data.signature;

    await abrirBoldCheckout({
      apiKey: apiKey,
      reference: reserva.referenciaPago,
      amount: reserva.valorTotal,
      currency: "COP",
      signature: signature,
      description: `Reserva ${reserva.nombreTour}`,
      redirectionUrl: "https://rutaxplorer.com/app/invoice/",
      
    });
  } catch (error) {
    console.error("Error al iniciar pago con Bold:", error);

    toast.error(t("avisosReserva.errorPasarela"), {
      position: "top-right",
    });
  }
};

  function agregarHorasDesdeCadena(cadena) {
  const nuevasHoras = (cadena || '')
    .split('/')                    // separa por coma
    .map(hora => hora.trim())     // quita espacios extra
    .filter(hora => hora !== ''); // elimina vacíos

   setAvailableTimes(nuevasHoras)
}

function agregarIncluidos(cadena){
  const nuevosIncluidos = (cadena || '')
    .split(',')                    // separa por coma
    .map(hora => hora.trim())     // quita espacios extra
    .filter(hora => hora !== '');
    
  setIncluidos(nuevosIncluidos)
}
function agregarRecomendaciones(cadena){
  
  
  const nuevosRecomendaciones = (cadena || '')
    .split(',')                    // separa por coma
    .map(hora => hora.trim())     // quita espacios extra
    .filter(hora => hora !== '');
    
  setRecomendaciones(nuevosRecomendaciones)
}

useEffect(() => {
  if (!tour) return;
  agregarHorasDesdeCadena(tour.salidas);
  agregarIncluidos(tour.incluido);
  agregarRecomendaciones(tour.recomendaciones);
  setPrecioMostrar(
    tour.tipo === "compartido"
      ? tour.precio
      : tarifasValidas(tour.precios).at(-1)?.precioPorPersona ?? null
  );

}, [tour]);



const claveReservas = tour?.id && selectedDate ? `${tour.id}/${formatearFechaLocal(selectedDate)}` : '';
const minimoPersonas = tour?.tipo === 'compartido' && consultaReservasClave === claveReservas &&
  horariosConReserva.has(selectedTime) ? 1 : Number(tour?.cantidadMinima ?? 1);
useEffect(() => {
  if (tour?.tipo === 'compartido') setAdults(prev => Math.max(minimoPersonas, prev));
}, [minimoPersonas, tour?.tipo]);

const handleAdultChange = (delta) => {
  setAdults((prev) => {
    const nuevaCantidad = prev + delta;

    // Si existe tour y tiene definida cantidadMinima, úsala, si no usa 1
    const min = minimoPersonas;
    const max = tour?.cantidadMaxima ?? Infinity;

    if (nuevaCantidad < min) return min;
    if (nuevaCantidad > max) return max;

    return nuevaCantidad;
  });
};
const personasReserva = Number(tour?.tipo === "privado" ? selectedPersonas : adults);
const tienePromocion = promocionVisible(tour, hoyPromocion);
const promocionReserva = aplicaPromocion(tour, personasReserva, hoyPromocion);
const extrasDetalleActual = detalleExtras(tour?.extras, extrasSeleccionados, personasReserva);
const totalExtras = extrasDetalleActual.reduce((total, extra) => total + extra.subtotal, 0);

useEffect(() => {
  setExtrasSeleccionados(prev => {
    const siguientes = {};
    for (const extra of tour?.extras || []) {
      if (precioAplicableExtra(extra, personasReserva) !== null && prev[extra.id] > 0) {
        siguientes[extra.id] = Math.min(prev[extra.id], Number(extra.maxCantidad));
      }
    }
    return siguientes;
  });
}, [personasReserva, tour?.extras]);

const baseTotal = Number(basePrice ?? 0) * Number(adults ?? 0);
const escalonTotal = selectedEscalon != null ? Number(selectedEscalon) : null;


const totalTourNormal = escalonTotal ?? baseTotal;
const totalTour = promocionReserva ? Number(tour.precioPromocion) * personasReserva : totalTourNormal;
const pago = cotizarPago(totalTour + totalExtras, metodoPago);
const totalFinal = pago.valorTotal;

const construirExtrasDetalle = () => {
  return extrasDetalleActual;
};
 


const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

 const handleReserva = async () => {
  if (creandoReserva || reservaManual) return;
  if (tour?.tipo === 'compartido' && (!Number.isInteger(adults) || adults < minimoPersonas || adults > Number(tour.cantidadMaxima))) {
    toast.info(`Selecciona entre ${minimoPersonas} y ${tour.cantidadMaxima} personas.`);
    return;
  }
  if (!reservaHabilitada(tour) || !metodosPermitidos(tour.metodosPago).includes(metodoPago) || !Number.isFinite(totalFinal) || totalFinal <= 0) {
    toast.info(t('datosApi.noReservable'));
    return;
  }
  const extrasDetalle = construirExtrasDetalle();

  const esCorreoValido = (correo) => {
    
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo);
  
  }; 
  if (!selectedDate) {
    toast.info(t("avisosReserva.fecha"));
    return;
  }
  if (fechaNoDisponible(selectedDate)) {
  toast.info(t("avisosReserva.fechaNoDisponible"));
  return;
}
  if (!selectedTime) {
    toast.info(t("avisosReserva.horario"));
    return;
  }
  if (!selectedDate || !selectedTime || !nombreUsuario || !correoUsuario || !tipoDocumento || !numeroDocumento) {
    toast.info(t("avisosReserva.campos"), {
            position: "top-right"
            });
            
    return;
  }
   if (!esCorreoValido(correoUsuario.trim())) {
    toast.info(t("avisosReserva.correo"));
    return;
  }
  

  if(tour.tipo==="privado" && !selectedEscalon){
    toast.info(t("avisosReserva.personas"), )
    return;
  }
  // const isValid = await verifyDate();
  // if (!isValid) return; // Evita ejecutar lo demás
  if (!aceptaTerminos) {

      toast.info(t("avisosReserva.terminos"), )
      return;
    }

  try {
   
    setCreandoReserva(true);
    const response = await axios.post("/api/reservas", {
      metodoPago,
      nombreTour:tour.nombre,
      fecha: formatearFechaLocal(selectedDate),
      horario:selectedTime,
      salida: tour.salida,
      idioma:idioma,
      nombrePersona: nombreUsuario,
      correo: correoUsuario.trim(),
      telefono:telefonoUsuario,
      cantidadPersonas:  tour.tipo === "privado" ? selectedPersonas : adults ,//esto
      valorTotal: totalFinal , //esto
      tourId: tour.id,
      hotel: getReservationHotel(hotel, recepcionista),      
      extras: extrasDetalle,
      tipoDocumento: tipoDocumento,
      numeroDocumento: numeroDocumento,
      hotelCliente:hotelCliente,
      pais:pais
    });

   if (response.status === 201 || response.status === 200) {
      if (["transferencia", "efectivo", "transferencia_sin", "efectivo_sin"].includes(response.data.reserva.metodoPago)) {
        setReservaManual(response.data);
        return;
      }
      

      toast.info(t("avisosReserva.iniciandoPago"), {
        position: "top-right"
      });
      await esperar(3000);
      await obtenerFirma(response.data)

    
    }
    
  } catch (error) {
    console.error("❌ Error al reservar:", error);
     toast.error(error.response?.data?.mensaje || t("avisosReserva.errorReserva"), {
            position: "top-right"
            });
  } finally {
    setCreandoReserva(false);
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

useEffect(() => {
  let vigente = true;
  if (!tour?.id || (!tour?.reservaUltimaHora && tour?.tipo !== 'compartido') || !selectedDate || !(availableTimes || []).length) {
    setHorariosConReserva(new Set());
    setConsultaReservasClave('');
    return;
  }

  const fecha = formatearFechaLocal(selectedDate);

  Promise.allSettled(
    availableTimes.map((t) =>
      axios.get(`/api/reservas/fecha/${fecha}/${tour.id}/${encodeURIComponent(t)}`)
    )
  ).then((results) => {
    if (!vigente) return;
    const set = new Set();
    results.forEach((r, i) => {
      if (r.status === "fulfilled") set.add(availableTimes[i]); // ese horario tiene reserva
    });
    setHorariosConReserva(set);
    setConsultaReservasClave(`${tour.id}/${fecha}`);

  }

);
  return () => { vigente = false; };
}, [tour?.id, tour?.tipo, tour?.reservaUltimaHora, selectedDate, availableTimes]);

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
  const dt = new Date(selectedDate);
  dt.setHours(h, m, 0, 0);

  const minutosLimite = Number(tour?.horaLimite ?? 0);

  const cutoffMin =
    (tour?.reservaUltimaHora && horariosConReserva.has(selectedTime))
      ? 0
      : minutosLimite;

  const cutoff = new Date(Date.now() + cutoffMin * 60 * 1000);

  if (dt < cutoff) setSelectedTime("");
}, [
  selectedDate,
  selectedTime,
  tour?.horaLimite,
  tour?.reservaUltimaHora,
  horariosConReserva
]);

const limpiarComillas = (valor) => {
  if (valor === null || valor === undefined) return "";

  let limpio = String(valor).trim();

  while (
    (limpio.startsWith('"') && limpio.endsWith('"')) ||
    (limpio.startsWith("'") && limpio.endsWith("'"))
  ) {
    try {
      limpio = JSON.parse(limpio);
      limpio = String(limpio).trim();
    } catch {
      limpio = limpio.slice(1, -1).trim();
    }
  }

  return limpio;
};

function formatearFechaLocal(date) {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const fechaNoDisponible = (date) => {
  if (!date || !tour) return false;

  const fechaSeleccionada = formatearFechaLocal(date);
  const diaSemana = String(date.getDay());

  const diasSemanaBloqueados = diasBloqueados(tour.diasNoDisponibles);

  const fechasBloqueadas = limpiarComillas(tour.fechasNoDisponibles)
    .split(",")
    .map((fecha) => fecha.trim())
    .filter(Boolean);

  return (
    diasSemanaBloqueados.includes(diaSemana) ||
    fechasBloqueadas.includes(fechaSeleccionada)
  );
};





if (cargando) {
  return (
    <div className="loader-container">
      <div className="loader-rutaxplorer"></div>
      <p>Cargando experiencias...</p>
    </div>
  );
}

if (errorCarga || !tour) {
  return <><Header /><main className="tour-message" role="alert">
    <h1>{t('datosApi.tourNoDisponible')}</h1>
    <p>{t('datosApi.intentarDespues')}</p>
    <Link to={withReferral("/tours", hotel, searchParams)}>{t('datosApi.volverTours')}</Link>
  </main><Footer /></>;
}


  return (
    
    <>
    <Seo
      title={`${tour.nombre} | Ruta Xplorer`}
      description={tourSeoDescription(tour.descripcion, tour.nombre, lang)}
      image={tour.fotos?.[0]}
      path={getTourPublicPath(validTourSlug(tour.slug) ? tour.slug : slug)}
      type="product"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "TouristTrip",
        name: tour.nombre,
        description: tour.descripcion,
        image: tour.fotos || [],
        touristType: "Turismo de naturaleza",
        provider: {
          "@type": "TravelAgency",
          name: "Ruta Xplorer",
          url: "https://rutaxplorer.com/app/tours",
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "COP",
          price: tienePromocion ? Number(tour.precioPromocion) : Number(precioMostrar) || Number(tour.precio) || 0,
          availability: "https://schema.org/InStock",
          url: `https://rutaxplorer.com${getTourPublicPath(validTourSlug(tour.slug) ? tour.slug : slug)}`,
        },
      }}
    />
    <Header></Header>
      {!tour ?(<>
      <div className="tour-message">
        
        <h2>En el momento nos encontramos en mantenimiento...</h2>
        <h2> Si deseas reservar con nosotros te invitamos a escribirnos al siguiente numero:</h2>
        <h2 className='phone'>+57 3124151539</h2>
        <img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASYAAACrCAMAAAD8Q8FaAAABtlBMVEUordJCouT///8orNMfpclauPgGUoj///0DL1lCouZCouMorNSq2OZFpOn2///5//8DR3IAKFQ7caHq6OcbS4BSgac2dq5LqOgAMlzl8vgdfawALVoDSHFDkMwFS38AP3Tt//8UZo3L6PMAI1E+qMQffabQ9fkymL5YtM5Un9UAKFElirItsdPQ4fAANWAjU3UnaJhIjr8AG0q85+8AQG2s4OU/nOQqQ38AN2fj+/0gdZk2frE4j9Bwvs8AEUKQqLY2kuAwit4AVred4esmWYhdvfqDzN13ueJctvylz+crgt02n7s5ecQccNciedkAYr4yhMUNacKRs9cWTpwAXsgOMG6pxNJ1hJbT3+J4y92R4u+NytZ/1eTU/f5dvdGk6e9spLGBweYZO1tQmLSFustqtOew3fJopdO68vkukLRymspXkKoAMGS01e5EpLhnscObweRaiMR+ncEARLsyTWxuirR8m7sqb7xrmNAaW69LY4G9yOTg5/oAKqgAK5aVosBbfcIHP6YhaKQaXNAQU5NSYogcYaypwcuVnbMAJWVcbpEQVa0YS5FTZoszSHaD2PiB4/8AAEoPS7+dAAAfzElEQVR4nO2dj0Mad7LAYXcV2RVQmzMSlICssAgaEpAElZZfahUjIZomRqu11ySmjfnR1zuba/uul7ZJW728e//xm5nvd5cFFrVK0vSVScBlgXX3szPznZnv7GqzdaQjHelIRzrSkY50pCMd6UhHOtKRjnSkIx3pSEc60pGOdKQjHelIR84oosh//r678UeRDqajJa4Qo3iHU0sBixNFMW5T4vCjw+k4kUBsHU5HiCjZbOrdzc27kmiTfu+dObuI6ECYabTtrMPGyut3JUndlMp3y5J6d0tS2O/6f+LS23MQorh1d2trs7iblaSNqWJRzd7dsin8lPxBRVFQl0Q63e3CJG1qorQRnipubhanPn4iSdn1tm38dxHRFocnRbeJthwJ+O1ssXx3U5NItM3N8jYu/zGVifZZlGLBS8OpvuFL0zHFFo+f+VBEdNzZqXBRVcS4SJuT1GJyKnt3U0LDU1iADg9FpJFQYq5RacchvQGBuCauxIZTiZHova7z56MzpWvBCGrXWTjB0UvrWXX+4ywwESVV21JhQZHmP55X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'></img>



      </div>

      </> ):
      ( <div className="tour-page">
        <Terminos 
              isOpen={isModalOpen}
              onClose={cerrarModal}
              title="Términos y Condiciones de Reserva y Cancelación"
          ></Terminos>
      <div className="tour-main">
        
        <div className='titulo_tour'><p>{t("tour.tipoTuristico")}</p><h1>{tour.nombre}</h1> <span></span>
          <div className='precio'>
            {tienePromocion ? (
              <PrecioPromocion precioNormal={precioMostrar} precioPromocion={tour.precioPromocion} tipo={tour.tipo} />
            ) : precioMostrar != null && Number(precioMostrar) > 0 ? <>{t("card.desde")}: ${Number(precioMostrar).toLocaleString()} {t("card.moneda")}</> : t('datosApi.precioPendiente')}
          </div>
        </div>
        <GaleriaTour key={tour.id ?? slug} fotos={tour.fotos} nombre={tour.nombre} />

        <div className="tour-info-block" data-aos="fade-up">
  <div className='container_descripcion' data-aos="fade-up">
    <h2>{t("tour.descripcion")}</h2>
    <p className='descripcion_tour'>
      {tour.descripcion}
    </p>
  </div>

  <div className="tour-icons">
    <div>
      <i className="bi bi-stopwatch"></i>
      <p>
        <strong>{t("tour.duracion")}</strong><br />
        <span>{tour.tiempo}</span>
      </p>
    </div>

    <div>
      <i className="bi bi-person-dash"></i>
      <p>
        <strong>{t("tour.cantidadMinima")}</strong><br />
        <span>{tour.cantidadMinima}</span>
        
      </p>
    </div>

    <div>
      <i className="bi bi-calendar-date"></i>
      <p>
        <strong>{t("tour.toursPorDia")}</strong><br />
        <span>{tour.toursPorDia}</span>
        
      </p>
    </div>

    <div>
      <i className="bi bi-clipboard2-check"></i>
      <p>
        <strong>{t("tour.horarios")}</strong><br />
        <span>{tour.salidas}</span>
        
      </p>
    </div>

    <div>
      <i className="bi bi-translate"></i>
      <p>
        <strong>{t("tour.idioma")}</strong><br />
        <span>{tour.idioma}</span>
        
      </p>
    </div>

    <div>
      <i className="bi bi-pin-map-fill"></i>
      <p>
        <strong>{t("tour.lugarSalida")}</strong><br />
        <span>{tour.salida}</span>
        
      </p>
    </div>
  </div>

  <h2>{t("tour.incluido")}</h2>

  <ul className="lista_incluidos">
    {incluidos.length > 0 &&
      incluidos.map((incluido, index) => (
        <li key={index}>
          <i className="bi bi-check-circle"></i> {incluido}
        </li>
      ))
    }
  </ul>

  <h2>{t("tour.recomendaciones")}</h2>

  <ul className="lista_recomendaciones">
    {recomendaciones.length > 0 &&
      recomendaciones.map((item, index) => (
        <li key={index}>
          <i className="bi bi-info-circle"></i> {item}
        </li>
      ))
    }
  </ul>

  <ItinerarioTour tour={tour} />
            </div>
          <div style={{maxWidth: "100%", height: "400px", borderRadius: "14px", overflow: "hidden", marginTop: "20px" }} data-aos="fade-up">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.7638939707517!2d-75.572946!3d4.6361604000000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e388df9d2f6e29d%3A0x292561140c00b46b!2sSalento%20ToursRuta.Xplorer%20SAS%20Transporte%20y%20turismo!5e0!3m2!1ses-419!2sco!4v1771820613835!5m2!1ses-419!2sco"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa - RutaXplorer"
          />
        </div>

 
        </div>
    

      <div className="tour-sidebar" data-aos="fade-up">
        <div className="tour-reservation">
          {reservaManual ? <ReservaManual resultado={reservaManual} /> : <>
            <p className='titulo_calendario'>{t("tour.reserva")}</p>
          <label>{t("tour.fecha")}:</label>
           <CalendarioReservas
            key={tour.id}
            tourId={tour.id}
            mostrarReservas={tour.mostrarReservasCalendario}
            fechaNoDisponible={fechaNoDisponible}
            selected={selectedDate}
            onChange={(date) => {
              if (fechaNoDisponible(date)) {
                toast.info(t("avisosReserva.fechaNoDisponible"));
                return;
              }

              setSelectedDate(date);
              setSelectedTime("");
            }}
          />
          <label>{t("tour.horario")}:</label>
          <select  className="select-horario" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
            <option value="">{t("tour.seleccionaHorario")}</option>
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
                    // const cutoff = new Date(now.getTime() + 4 * 60 * 60 * 1000);

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
                    const y = baseDate.getFullYear();
                    const mo = baseDate.getMonth();
                    const d = baseDate.getDate();

                   const dt = new Date(y, mo, d)
                    dt.setHours(h, min, 0, 0);
                        // 🔑 HORA LÍMITE EN MINUTOS
                  const minutosLimite = Number(tour?.horaLimite ?? 0);
                  const key = (s) => String(s || "").replace(/\s+/g, "").toUpperCase();

      const cutoffMin =
        (tour?.reservaUltimaHora && horariosConReserva.has(key(t)))
          ? 0
          : minutosLimite;
       
    

      const cutoff = new Date(now.getTime() + cutoffMin * 60 * 1000);
      return dt >= cutoff;
                  })
                  .map((time, i) => (
                    <option key={i} value={time}>{time}</option>
                  ))
                }
          </select>
          <label>{t("tour.idioma")}</label>
          <select
            className="input"
            value={idioma}
            onChange={(e) => setIdioma(e.target.value)}
          >
            <option value="">{t("tour.seleccionaIdioma")}</option>

            {tour?.idioma &&
              tour.idioma.split("/").map((idioma, index) => (
                <option key={index} value={idioma.trim()}>
                  {idioma.trim()}
                </option>
              ))}
          </select>
          <label>{t("tour.nombre")}:</label>
          <input 
          className='input'
           placeholder={t("tour.nombre")} 
            value={nombreUsuario} 
            onChange={(e) => setNombreUsuario(e.target.value)}>
          </input>
          
          <label>{t("tour.correo")}:</label>
          <input placeholder={t("tour.correoPlaceholder")} className='input'
          value={correoUsuario} 
          type="email"
          onChange={(e) => setCorreoUsuario(e.target.value)} required>
            
          </input>
          <label>{t("tour.tipodocumento")}:</label>
          <select className="input" value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}>
            <option value="cedula">{t("tour.cedula")}</option>
            <option value="pasaporte">{t("tour.pasaporte")}</option>
          </select>
          <label>{t("tour.numeroDocumento")}:</label>
          <input placeholder={t("tour.numeroDocumentoPlaceholder")} className='input'
          value={numeroDocumento} 
          onChange={(e) => setNumeroDocumento(e.target.value)} required>
            
          </input>  
          <label>{t("tour.telefono")}:</label>
          <input placeholder={t("tour.telefonoPlaceholder")}
          className='input'
          value={telefonoUsuario} 
          type='tel'
          onChange={(e) => setTelefonoUsuario(e.target.value)} required>
            
          </input>
          <label>{t("tour.pais")}:</label>
          <input placeholder={t("tour.paisPlaceholder")}
          className='input'
          value={pais} 
          
          onChange={(e) => setPais(e.target.value)} >
            
          </input>
          <label>{t("tour.hotel")}:</label>
          <input placeholder={t("tour.hotelPlaceholder")}
          className='input'
          value={hotelCliente} 
          
          onChange={(e) => setHotelCliente(e.target.value)} >
            
          </input>
          <label>{t("tour.recomendado")}:</label>
                  <input 
                  className='recepcion input'
                  placeholder={t("tour.recepcionistaPlaceholder")} 
                    value={recepcionista} 
                    onChange={(e) => setRecepcionista(e.target.value)}>
                  </input>
          <div className={`extras extras-reserva ${activo ? ' activo': ''}` }>
            <button type="button" className="extras-reserva-toggle" aria-expanded={activo} onClick={()=>setActivo(!activo)}>{t("tour.serviciosAdicionales")}  {!activo ? <i className="bi bi-chevron-down" aria-hidden="true"></i>: <i className="bi bi-chevron-up" aria-hidden="true"></i>} </button>
            <div hidden={!activo}>
              {(tour.extras || []).map((extra, i) => {
               const valorAplicable = precioAplicableExtra(extra, personasReserva);
               const disponible = valorAplicable !== null;
               const value = disponible ? extrasSeleccionados[extra.id] || "" : "";


              return (
                <div key={extra.id || i} className={`extra ${disponible ? '' : 'extra-no-disponible'}`}>
                  <p>{extra.nombre}</p>
                  
                  <div className='precios-extra'>

                  <label className="extra-cantidad-label" htmlFor={`cantidad-extra-${extra.id || i}`}>{t("extras.cantidad", { nombre: extra.nombre })}</label>
                  <input
                    id={`cantidad-extra-${extra.id || i}`}
                    type="number"
                    min={0}
                    step={1}
                    max={extra.maxCantidad}
                    disabled={!disponible}
                    aria-label={t("extras.cantidad", { nombre: extra.nombre })}
                    value={value}
                    onChange={(e) => {
                  //      console.log("onChange fired:", {
                  //   id: extra.id,
                  //   name: extra.nombre,
                  //   raw: e.target.value,
                  //   type: typeof e.target.value,
                  //   max: extra.maxCantidad
                  // });

                      
                      let val = Math.floor(Number(e.target.value) || 0);

                      if (val > extra.maxCantidad) {
                        val = extra.maxCantidad; // 🔒 límite duro
                      }

                      if (val < 0) val = 0;

                      setExtrasSeleccionados(prev => ({
                        ...(prev || {}),
                        [extra.id]: val
                      }));
                    }}
                  />
                  <small className="extra-precio" aria-live="polite">
                  {disponible ? t("extras.precio", { valor: valorAplicable.toLocaleString("es-CO"), max: extra.maxCantidad })
                    : personasReserva > 0 ? t("extras.noDisponible", { personas: personasReserva }) : t("extras.seleccionaPersonas")}
                  </small>
                  {disponible && Number(value) > 0 && (
                    <small className="extra-subtotal" aria-live="polite">{t("extras.subtotal", { valor: (valorAplicable * Number(value)).toLocaleString("es-CO") })}</small>
                  )}
                  </div>
                  
                </div>
              );
            })}
              </div>
              
              
            </div> 
          {/* Si el tour es compartido */}
          {tour.tipo === "compartido" && (
            <>
              <div className="adult-counter">
                <label>{t("tour.personas")}:</label>
                <div>
                  <button disabled={adults <= minimoPersonas} onClick={() =>{ handleAdultChange(-1); console.log(amount)}}>-</button>
                  <span>{adults}</span>
                  <button
                    onClick={() => {handleAdultChange(1);  console.log(amount)}}
                    disabled={tour && adults >= tour.cantidadMaxima}
                  >
                    +
                  </button>
                </div>
                <small>Mínimo para esta salida: {minimoPersonas} {minimoPersonas === 1 ? 'persona' : 'personas'}.</small>
              </div>
              <p className='precio total'>
                <strong>Total:</strong>{" "}
                <span>${parseInt(totalFinal).toLocaleString("es-CO")}</span>
              </p>
            </>
          )}

          {/* Si el tour es privado */}
          
          {tour.tipo === "privado" && (
            <>
              <label>{t("tour.seleccionaPersonas")}:</label>
              <select
              className='recepcion'
                value={selectedPersonas || ""}
                onChange={(e) => {
                      const personas = e.target.value;
                      const tarifa = tarifasValidas(tour.precios).find(p => Number(p.personas) === Number(personas));
                      const total = tarifa ? Number(tarifa.precioPorPersona) * Number(personas) : null;
                      setSelectedEscalon(total);
                      setAmount(total || 0);
                      setSelectedPersonas(personas);
                      
                       // 👈 guarda personas
                }
                }
              >
                <option value="">{t("tour.seleccionaOpcion")}</option>
                
                {Array.isArray(tour.precios) &&
                  tarifasValidas(tour.precios).filter(p => p.personas >= tour.cantidadMinima && p.personas <= tour.cantidadMaxima).map((p, idx) => (
                    <option
                      key={idx}
                      value={p.personas}
                      data-personas={p.personas} // 👈 usar dataset
                      
                    >
                      {p.personas} {t("tour.personas")} - ${precioAplicableTour(tour, p.personas, p.precioPorPersona, hoyPromocion).toLocaleString("es-CO")} COP c/u
                    </option>
                  ))}
              </select>
             
              
                  
              
                  
              {selectedEscalon && (
                <p className="precio total">
                  <strong>{t("tour.total")}:</strong>{" "}
                  <span>${parseInt(totalFinal).toLocaleString("es-CO")}</span>
                </p>
              )}
            </>
          )}
          {tienePromocion && personasReserva > 0 && (
            <p aria-live="polite">{promocionReserva ? t('promocion.aplicada') : ''}</p>
          )}
          <MetodoPago metodo={metodoPago} onChange={setMetodoPago} pago={pago} disabled={creandoReserva} metodos={tour.metodosPago} />
          <div className='terminos-container'> 
             <input
            type="checkbox"
            checked={aceptaTerminos}
            onChange={() => setAceptaTerminos(!aceptaTerminos)}
            className='check-terminos'
          />
           <p onClick={abrirModal} className="btn-link">
              {t("tour.terminosCondiciones")}
            </p>
          </div>
           
          
         
          <div className='container_bold'>
            {!reservaHabilitada(tour) && <p role="status">{t('datosApi.noReservable')}</p>}
            {!firmaBold && (<button  className={`reserve-btn ${admin ? "disable" : ""}`} disabled={admin || creandoReserva || !reservaHabilitada(tour)} onClick={handleReserva}>{t(creandoReserva ? "metodosPago.creando" : "tour.reservarAhora")}</button>)}
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
          
          
         
          </>}
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
