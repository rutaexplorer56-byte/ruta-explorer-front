import Card from "../components/card";
import Header from "../components/header";
import Footer from "../components/footer";
import '../styles/tours.css'
import AOS from 'aos';
import { useEffect,useState,useRef } from 'react';
import axios from "../axiosConfig";
import { useParams } from 'react-router-dom';
import { set } from "date-fns";
import FilteredTours from "../components/filteredTours";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import imagen from "../assets/paisaje_hero.png";
import GoogleReviews from "../components/GoogleReviews";
function Tours(){

  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const lang = (i18n.language || "es").split("-")[0];
    useEffect(() => {
      AOS.init({
        duration: 1000, // duración de la animación
        once: true,     // solo una vez al entrar al viewport
      });
    }, []);
   


  const [tours, setTours] = useState([]);
  const [slide, setSlide] = useState(0);
  const pausedRef = useRef(false);
  const { hotel} = useParams();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [numCategoria, setnumCategoria] = useState("");
  const [mostrarTours, setMostrarTours] = useState(true);

  const images = [
    imagen

  ];


// const categorias = [ { id: "1", label: "Rutas cafeteras", description: "Recorridos inmersivos por el corazón del Paisaje Cultural Cafetero, descubriendo fincas, miradores y la esencia del café colombiano.", img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/7b/8f/64/caption.jpg?w=500&h=400&s=1",  }, { id: "2", label: "Experiencias de senderismo privadas", description:"Tours exclusivos de senderismo con guía personal, ideales para quienes buscan tranquilidad, flexibilidad y una conexión más íntima con la naturaleza.", img: "https://cdn.getyourguide.com/image/format=auto,fit=contain,gravity=auto,quality=60,width=1440,height=650,dpr=1/tour_img/4c3da771a8af41b49b18b11c2c26e0bee40e4b32982966e00d8ebd4185435049.jpg", }, { id: "3", label: "Experiencias senderismo (compartidas)", description:"Caminatas grupales en los principales destinos naturales del Eje Cafetero, perfectas para disfrutar en compañía y conocer nuevos viajeros.", img: "https://www.quindioecotours.com/wp-content/uploads/2020/07/Carbonera-2.jpg", }, { id: "4", label: "⁠Experiencias de aventura", description:"Actividades llenas de adrenalina como cabalgatas, canopy, cuatrimotos y más, creadas para quienes buscan emoción en el Eje Cafetero.", img: "https://www.valledelcocora.com.co/w/wp-content/uploads/2024/07/Caballos.jpg", }, { id: "5", label: "⁠Parques temáticos", description:"Visitas a los parques más emblemáticos de la región, combinando diversión, cultura y naturaleza para todas las edades.", img: "https://parquedelcafe.co/wp-content/uploads/2024/12/PDC-Avix-Experiencia-012-scaled.jpg", }, { id: "6", label: "⁠Experiencias gastronómicas", description:"Degustaciones, clases y recorridos culinarios donde podrás disfrutar los sabores auténticos del Eje Cafetero.", img: "https://arracheramex.wordpress.com/wp-content/uploads/2013/09/tejaditos_trucha.jpg", }, { id: "7", label: "⁠Tours con salida desde Pereira", description:"Experiencias especialmente diseñadas para viajeros ubicados en Pereira, con transporte incluido y rutas optimizadas.", img: "https://elpereirano.com/wp-content/uploads/2025/02/6747cfeab9c02.r_d.1215-694-8176.jpeg", }, { id: "8", label: "⁠Tours con salida desde Filandia", description:"Experiencias especialmente diseñadas para viajeros que se encuentren ubicados en Filandia", img: "https://elpereirano.com/wp-content/uploads/2025/02/6747cfeab9c02.r_d.1215-694-8176.jpeg", }, ];
const categorias = [
  {
    id: "1",
    labelKey: "categories.coffeeRoutes.label",
    descKey: "categories.coffeeRoutes.description",
    img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/7b/8f/64/caption.jpg?w=500&h=400&s=1",
  },
  {
    id: "2",
    labelKey: "categories.privateHiking.label",
    descKey: "categories.privateHiking.description",
    img: "https://cdn.getyourguide.com/image/format=auto,fit=contain,gravity=auto,quality=60,width=1440,height=650,dpr=1/tour_img/4c3da771a8af41b49b18b11c2c26e0bee40e4b32982966e00d8ebd4185435049.jpg",
  },
  {
    id: "3",
    labelKey: "categories.sharedHiking.label",
    descKey: "categories.sharedHiking.description",
    img: "https://www.quindioecotours.com/wp-content/uploads/2020/07/Carbonera-2.jpg",
  },
  {
    id: "4",
    labelKey: "categories.adventure.label",
    descKey: "categories.adventure.description",
    img: "https://www.valledelcocora.com.co/w/wp-content/uploads/2024/07/Caballos.jpg",
  },
  {
    id: "5",
    labelKey: "categories.themeParks.label",
    descKey: "categories.themeParks.description",
    img: "https://parquedelcafe.co/wp-content/uploads/2024/12/PDC-Avix-Experiencia-012-scaled.jpg",
  },
  {
    id: "6",
    labelKey: "categories.gastronomy.label",
    descKey: "categories.gastronomy.description",
    img: "https://arracheramex.wordpress.com/wp-content/uploads/2013/09/tejaditos_trucha.jpg",
  },
  {
    id: "7",
    labelKey: "categories.fromPereira.label",
    descKey: "categories.fromPereira.description",
    img: "https://elpereirano.com/wp-content/uploads/2025/02/6747cfeab9c02.r_d.1215-694-8176.jpeg",
  },
  {
    id: "8",
    labelKey: "categories.fromFilandia.label",
    descKey: "categories.fromFilandia.description",
    img: "https://elpereirano.com/wp-content/uploads/2025/02/6747cfeab9c02.r_d.1215-694-8176.jpeg",
  },
];



  useEffect(() => {
    const obtenerTours = async () => {
      try {
        const res = await axios.get('/api/tours');
        
        setTours(res.data); // aquí actualizamos el estado
        
      } catch (error) {
        console.error('Error al obtener tours:', error);
      }
    };
    obtenerTours();
  }, [lang]);


  // useEffect(() => {
  //   const id = setInterval(() => {
  //     if (!pausedRef.current) {
  //       setSlide((s) => (s + 1) % images.length);
  //     }
  //   }, 4000);
  //   return () => clearInterval(id);
  // },[]);
const scrollLeft = (id) => {
  const container = document.getElementById(`scroll-${id}`);
  container.scrollBy({ left: -250, behavior: "smooth" });
};

const scrollRight = (id) => {
  const container = document.getElementById(`scroll-${id}`);
  container.scrollBy({ left: 200, behavior: "smooth" });
};
const seccionRef = useRef(null);

  const scrollToSection = () => {
    seccionRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };

    return(
            <>
            <Header></Header>
            <div className="container_tours">
                {/* <div className="hero-slider fade"data-aos="fade-down">
                    {images.map((src, i) => (
                      <div
                        key={i}
                        className={`fade-slide ${i === slide ? "active" : ""}`}
                        style={{ backgroundImage: `url(${src})` }}
                      ><span className="bg">
                        </span>
                        <div className="titulo">
                        " {t("hero.title")}"

                      
                      
                        
                        <ul className="hero-incluidos"> 
                           <li>{t("hero.features.unique")}</li>
                          <li> - {t("hero.features.transport")} - </li>
                          <li>{t("hero.features.guides")}</li>
                          
                        </ul>
                        <div className="botones-hero">
                          <button className="btn-reservar-hero" onClick={scrollToSection}>
                            {t("hero.buttons.reserve")}
                            
                          </button>

                          <button className="btn-whatsapp-hero">
                            <i className="bi bi-whatsapp"></i>
                            <a href="https://wa.me/573124151539?text=Hola%20RutaExplorer%2C%20estoy%20interesado%20en%20reservar%20un%20tour.%20¿Podrían%20ayudarme%3F" target="_blank" rel="noopener noreferrer">
                            {t("hero.buttons.contact")}</a>
                          </button>
                          
                        </div>
                        
                       
                        
                      
                    </div>
                      </div>
                    ))}

                    
                  </div> */}
               
                <div className="titulo-tours">
                <p>{t("home.tours")}</p>
                <h1 className="titulo-tours">
                  {t("home.operadora")} <br />
                  {t("home.agencia")}
                </h1>
                <span></span>
              </div>
                <div className="container-tours" ref={seccionRef}>
                  {tours? (categorias.map((cat) => {
                     const toursDeCategoria = tours.filter(t => t.categoria === cat.id);

  // si no hay tours → NO renderizar nada
                  if (toursDeCategoria.length === 0) return null;
                  const showArrows = toursDeCategoria.length > 2;
                    return(
                      
                     <div className="categoria" key={cat.id}>
                          <h2 className="titulo-categoria">{t(cat.labelKey)}</h2>
                          <span className="span">{t(cat.descKey)}</span>

                          <div className="slider-wrapper">
                            {showArrows && (
                              <button
                                className="arrow left"
                                onClick={() => scrollLeft(cat.id)}
                              >
                                ◀
                              </button>
                            )}

                            <div id={`scroll-${cat.id}`} className="tours-categoria">
                              <FilteredTours
                              key={`${lang}-${cat.id}`}
                                categoria={cat.label}
                                numCategoria={cat.id}
                                hotel={hotel}
                              />
                            </div>

                            {showArrows && (
                              <button
                                className="arrow right"
                                onClick={() => scrollRight(cat.id)}
                              >
                                ▶
                              </button>
                            )}
                          </div>
                        </div>
                        
                        )})):
                        (
                           <div className="tour-message">
            
                              <h2>En el momento no contamos con tours disponibles ...</h2>
                              <h2> Si deseas reservar con nosotros te invitamos a escribirnos al siguiente numero:</h2>
                              <h2 className='phone'>+57 3124151539</h2>
                              <img src="https://www.mdirector.com/wp-content/uploads/2022/04/smsreservar.jpg" alt="No tours available" />
                                             
                            </div>
                        )
                  }
                  

                </div>


{/* 
                {tours?(
                    categorias.map((cat) => {
                      return(
                        <div className="categoria" key={cat.id}>
                        <h2 className="titulo-categoria">{cat.label}</h2>
                        <div className="tours-categoria">
                          <FilteredTours
                            categoria={cat.label} 
                            numCategoria={cat.id}
                            hotel={hotel}
                          />


                        </div>
                      </div>
                      )
                      
                    }
                      
                     
            

                  ):(<></>)} */}
                  
                
                  

                    <section className="seccion-reserva">
                        <div className="reserva-contenido">
                          <h3 className="reserva-subtitulo">...</h3>
                  <h2 className="reserva-titulo">
                          {t("booking.title")}
                        </h2>

                        <p className="reserva-texto">
                          {t("booking.p1")}
                        </p>

                        <p className="reserva-texto">
                          {t("booking.p2")}
                        </p>

                        <p className="reserva-texto">
                          {t("booking.p3")}
                            <br />
                          <strong>👉{t("booking.highlight")}</strong>
                        </p>
                          
                        </div>

                        <div className="reserva-imagenes">
                          <img src="https://cdn-icons-png.flaticon.com/512/7325/7325270.png" className="img-principal" />
                          
                        </div>
                      </section>


                   <div className="titulo-tours">
                  <p>Comentarios</p>
                  <h1>Ellos ya vivieron la aventura en Quindío - Colombia</h1>
                  <span></span>
                </div>
                <GoogleReviews></GoogleReviews>

                <div className="titulo-tours">
                  <p>{t("sectionLabel")}</p>
                  <h1>{t("sectionTitle")}</h1>
                  <span></span>
                </div>

                 <section className="experiencias-section">
                   
      
                    {/* CONTENEDOR DESPLAZABLE */}
                    <div className="experiencias-scroll">
                      {tours.slice(0, 4).map((exp) => (
                        <article key={exp.id} className="experiencia-card">
                          <div className="experiencia-img-wrapper">
                            <img src={exp.fotos[0]} alt={exp.titulo} />
                          </div>

                          <div className="experiencia-body">
                            <h3 className="experiencia-titulo">{exp.nombre}</h3>
                            <p className="experiencia-descripcion">{exp.descripcion}</p>

                            
                              <Link className="experiencia-link" to={`/tour/${hotel}/${exp.slug}`}>
                              Leer más <span>➜</span>
                              </Link>
                          
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                

           

                     
                    

               

               <div className="container_logos"data-aos="fade">
                <img className="img_logo" src="https://rutaxplorer.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-26-at-14.28.24.jpeg"></img>
                <img className="img_logo" src="https://rutaxplorer.com/wp-content/uploads/2023/08/logo_camara.jpeg"></img>
                <img className="img_logo" src="https://rutaxplorer.com/wp-content/uploads/2023/08/RNT.jpeg"></img>
                <img className="img_logo" src="https://rutaxplorer.com/wp-content/uploads/2023/08/logo_fontur.png"></img>
                <img className="img_logo" src="https://rutaxplorer.com/wp-content/uploads/2023/07/Tripadvisor_Logo_circle-green_vertical-lockup_registered_CMYK-1024x475.png"></img>
               </div>
               

            </div>
            <Footer></Footer>
            </>
    )
}

export default Tours;