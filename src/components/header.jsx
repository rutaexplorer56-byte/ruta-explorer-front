import { useState } from 'react';
import '../styles/header.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
 import AOS from 'aos';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import GoogleTranslate from './language';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo_nuevo.png';
import { toast } from "react-toastify";
import LanguageSelect from "../components/LanguajeSelect";
import ToursMegaMenu from "./ToursMegaMenu";
function Header(){
    useEffect(() => {
      AOS.init({
        duration: 1000, // duración de la animación
        once: true,     // solo una vez al entrar al viewport
      });
    }, []);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [btnMenu, setBtnMenu] = useState(false);
    const[menuAdmin,setMenuAdmin]=useState(false)
    const[nombre,setNombre]=useState("")
    const [openToursMenu, setOpenToursMenu] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    const header = document.querySelector(".header");

    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);
    const toggleClase = () => {
        setBtnMenu(!btnMenu);
        
    };
    useEffect(()=>{
      setNombre(localStorage.getItem("nombre"))
   
      if(localStorage.getItem("token")){
        setMenuAdmin(true)
      }else{
        setMenuAdmin(false)
      }

    },[menuAdmin])
     const logOut=()=>{
      localStorage.removeItem("token") 
      localStorage.removeItem("nombre") 
       toast.info("👋 Sesión cerrada correctamente", {
      position: "top-right"
      });
      setTimeout(() => {
        
      navigate('/login'); // Cambia "/destino" por la ruta a donde quieras redirigir
      }, 3000); // 3000 milisegundos = 3 segundos
      
    }
  useEffect(() => {
    if (btnMenu) setOpenToursMenu(false);
  }, [btnMenu]);
    
   

    return (
        <div className="container" data-aos="fade">
         
            
          
            <div className="info_header">
              
                <ul>
                    <li><i className="bi bi-envelope-fill"></i> reservas@rutaxplorer.com</li>
                    <li className='ubication'>{t('siguenos')}:<a href='https://www.facebook.com/people/Rutaxplorer/100090352211763/'><i className="bi bi-facebook"></i> </a> <a href='https://www.instagram.com/ruta.xplorer/'><i className="bi bi-instagram"></i></a> <a href='https://www.youtube.com/@ruta.xplorer/featured'><i className="bi bi-youtube"></i></a>  <a href='https://www.tiktok.com/@ruta.xplorer'><i className="bi bi-tiktok"></i></a></li>
                    <li ><i className="bi bi-geo-alt-fill"></i> <a href='https://www.google.com/maps/place/Salento+ToursRuta.Xplorer+SAS+Transporte+y+turismo/@4.6361604,-75.572946,17z/data=!3m1!4b1!4m6!3m5!1s0x8e388df9d2f6e29d:0x292561140c00b46b!8m2!3d4.6361604!4d-75.572946!16s%2Fg%2F11v496jwg0?entry=ttu&g_ep=EgoyMDI1MDgxOS4wIKXMDSoASAFQAw%3D%3D'>Mz B Casa 1 Barrio La nueva Floresta Salento - Quindío</a> <i className="bi bi-pin-map-fill"></i></li>
                   
                </ul>
            </div>
            <header className="header">
                <div className={`boton ${btnMenu?`voltear`:``} `} onClick={toggleClase}><i className="bi bi-chevron-double-down"></i></div>
                <Link to="https://rutaxplorer.com"><img src={logo}></img></Link>
                  <ul className={`${btnMenu ? 'menu' : ''}`}>
              {menuAdmin ? (
                <>
                  <li><Link to="/admin/reservations">{t('reservas')}</Link></li>
                  <li><Link to="/admin/tours">{t('tours')}</Link></li>
                  <li><Link to="/admin/tours">{t('comentarios')}</Link></li>
                  <h4 className='greeting'>{'Bienvenido'}:<p>{nombre}</p></h4>
                  <button className='close_sesion' onClick={logOut}>{t('Cerrar Sesión')}</button>
                </>
              ) : (
                <>
                  <li><a href='https://rutaxplorer.com/'>{t('inicio')}</a></li>
                  <li><a href='https://rutaxplorer.com/nosotros/'>{t('nosotros')}</a></li>
                  {/* <li><a href='https://rutaxplorer.com/servicios/'>{t('servicios')}</a></li> */}
                   <li
                        className="tours-hover"
                        onMouseEnter={() => setOpenToursMenu(true)}
                        
                      >
                        <a href="https://rutaxplorer.com/app/">{t("tours")}</a>

                        <ToursMegaMenu
                          open={openToursMenu}
                          onClose={() => setOpenToursMenu(false)}
                          onMouseLeave={() => setOpenToursMenu(false)}
                        />
                      </li>
                  <li><a href='https://rutaxplorer.com/contacto/'>{t('contacto')}</a></li>
                  {/* <li><a href='https://checkout.bold.co/payment/LNK_QO3ZYM10UC'>{t('pagos')}</a></li> */}
                  <a href='https://wa.me/573124151539?text=Hola%20RutaExplorer%2C%20estoy%20interesado%20en%20reservar%20un%20tour.%20¿Podrían%20ayudarme%3F'><h3 ><i className="bi bi-whatsapp"></i> 3124151539</h3></a>
                 
                  <LanguageSelect />
                  
                 
                </>
              )}
            </ul>
           {!menuAdmin ? (


            <div className="titulo">
                        " {t("hero.title")}"

                      
                      
                        
                        <ul className="hero-incluidos"> 
                           <li>{t("hero.features.unique")}</li>
                          <li> - {t("hero.features.transport")} - </li>
                          <li>{t("hero.features.guides")}</li>
                          
                        </ul>
                        <div className="botones-hero">
                          <button className="btn-reservar-hero" >
                            <Link to="/tours">{t("hero.buttons.reserve")}</Link>
                            
                            
                          </button>

                          <button className="btn-whatsapp-hero">
                            <i className="bi bi-whatsapp"></i>
                            <a href="https://wa.me/573124151539?text=Hola%20RutaExplorer%2C%20estoy%20interesado%20en%20reservar%20un%20tour.%20¿Podrían%20ayudarme%3F" target="_blank" rel="noopener noreferrer">
                            {t("hero.buttons.contact")}</a>
                          </button>
                          
                        </div>
                        </div>
           ):(<></>)}
            
                    
                        
                        
                       
                        
                      
                    

                    
                
                
                
            </header>
        </div>
    )

}

export default Header;



