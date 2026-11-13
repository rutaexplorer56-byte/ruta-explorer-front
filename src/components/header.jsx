import { useId, useRef, useState } from 'react';
import '../styles/header.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
 import AOS from 'aos';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { withReferral } from '../utils/tourUrls';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo_nuevo.png';
import { toast } from "react-toastify";
import LanguageSelect from "../components/LanguajeSelect";
import ToursMegaMenu from "./ToursMegaMenu";
import HeaderBackground from './HeaderBackground';
// Cambiar a true para recuperar el submenú de Tours sin reconstruirlo.
const MOSTRAR_SUBMENU_TOURS = false;
function Header(){
    const { search } = useLocation();
    const toursUrl = withReferral('/tours', undefined, search);
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
    const [esMovil, setEsMovil] = useState(() => window.matchMedia('(max-width: 1024px)').matches);
    const headerRef = useRef(null);
    const navShellRef = useRef(null);
    const [menuFijo, setMenuFijo] = useState(false);
    const menuButtonRef = useRef(null);
    const menuId = useId();
    const toursMenuId = useId();
    const cerrarMenus = () => { setBtnMenu(false); setOpenToursMenu(false); };

    useEffect(() => {
      const media = window.matchMedia('(max-width: 1024px)');
      const actualizar = () => {
        setEsMovil(media.matches);
        setBtnMenu(false);
        setOpenToursMenu(false);
      };
      media.addEventListener('change', actualizar);
      return () => media.removeEventListener('change', actualizar);
    }, []);

    useEffect(() => {
      if (!esMovil || !btnMenu) return;
      const cerrarFuera = event => {
        if (!headerRef.current?.contains(event.target)) {
          setBtnMenu(false);
          setOpenToursMenu(false);
        }
      };
      const cerrarConEscape = event => {
        if (event.key === 'Escape') {
          setBtnMenu(false);
          setOpenToursMenu(false);
          menuButtonRef.current?.focus();
        }
      };
      document.addEventListener('pointerdown', cerrarFuera);
      document.addEventListener('keydown', cerrarConEscape);
      return () => {
        document.removeEventListener('pointerdown', cerrarFuera);
        document.removeEventListener('keydown', cerrarConEscape);
      };
    }, [esMovil, btnMenu]);

useEffect(() => {
  const handleScroll = () => {
    if (!headerRef.current) return;
    const top = headerRef.current.getBoundingClientRect().top + 10;
    setMenuFijo(esMovil && top <= 0);
    navShellRef.current?.style.setProperty('--header-nav-top', `${Math.max(0, top)}px`);
  };

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleScroll);
  };
}, [esMovil]);
    const toggleClase = () => {
        setBtnMenu(abierto => !abierto);
        
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
      cerrarMenus();
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
        <div className="container rx-site-header" data-aos={esMovil ? undefined : 'fade'}>
         
            
          
            <div className="info_header">
              
                <ul>
                    <li><i className="bi bi-envelope-fill"></i> reservas@rutaxplorer.com</li>
                    <li className='ubication'>{t('siguenos')}:<a href='https://www.facebook.com/people/Rutaxplorer/100090352211763/'><i className="bi bi-facebook"></i> </a> <a href='https://www.instagram.com/ruta.xplorer/'><i className="bi bi-instagram"></i></a> <a href='https://www.youtube.com/@ruta.xplorer/featured'><i className="bi bi-youtube"></i></a>  <a href='https://www.tiktok.com/@ruta.xplorer'><i className="bi bi-tiktok"></i></a></li>
                    <li ><i className="bi bi-geo-alt-fill"></i> <a href='https://www.google.com/maps/place/Salento+ToursRuta.Xplorer+SAS+Transporte+y+turismo/@4.6361604,-75.572946,17z/data=!3m1!4b1!4m6!3m5!1s0x8e388df9d2f6e29d:0x292561140c00b46b!8m2!3d4.6361604!4d-75.572946!16s%2Fg%2F11v496jwg0?entry=ttu&g_ep=EgoyMDI1MDgxOS4wIKXMDSoASAFQAw%3D%3D'>Mz B Casa 1 Barrio La nueva Floresta Salento - Quindío</a> <i className="bi bi-pin-map-fill"></i></li>
                   
                </ul>
            </div>
            <header className={`header${menuAdmin ? ' header-admin' : ''}`} ref={headerRef}>
              {!menuAdmin && <HeaderBackground />}
              <div ref={navShellRef} className={`header-nav-shell${menuFijo ? ' is-sticky' : ''}`}>
                <div className="header-topbar">
                  <Link className="header-logo" to="https://rutaxplorer.com" onClick={cerrarMenus}>
                    <img src={logo} alt="RutaXplorer" />
                  </Link>
                  {esMovil && !menuAdmin && <div className="header-mobile-languages" role="group" aria-label={t('headerMobile.idiomas')}>
                    <LanguageSelect />
                  </div>}
                  <button type="button" ref={menuButtonRef} className="header-menu-toggle"
                    aria-expanded={btnMenu} aria-controls={menuId}
                    aria-label={t(btnMenu ? 'headerMobile.cerrar' : 'headerMobile.abrir')}
                    onClick={toggleClase}>
                    <i className={`bi ${btnMenu ? 'bi-x-lg' : 'bi-list'}`} aria-hidden="true" />
                  </button>
                </div>
                  <ul id={menuId} className={`header-navigation ${btnMenu ? 'menu' : ''}`}
                    aria-label={t('headerMobile.navegacion')}
                    onClick={event => { if (esMovil && event.target.closest('a')) cerrarMenus(); }}>
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
                        onMouseEnter={() => { if (MOSTRAR_SUBMENU_TOURS && !esMovil) setOpenToursMenu(true); }}
                        
                      >
                        <Link to={toursUrl}>{t("tours")}</Link>
                        {MOSTRAR_SUBMENU_TOURS && esMovil && <button type="button" className="header-tours-toggle"
                          aria-expanded={openToursMenu} aria-controls={toursMenuId}
                          aria-label={t(openToursMenu ? 'headerMobile.ocultarTours' : 'headerMobile.verTours')}
                          onClick={() => setOpenToursMenu(abierto => !abierto)}>
                          <i className={`bi ${openToursMenu ? 'bi-dash-lg' : 'bi-plus-lg'}`} aria-hidden="true" />
                        </button>}

                        {MOSTRAR_SUBMENU_TOURS && <ToursMegaMenu
                          id={toursMenuId}
                          open={openToursMenu}
                          onClose={() => setOpenToursMenu(false)}
                          onMouseLeave={() => { if (!esMovil) setOpenToursMenu(false); }}
                        />}
                      </li>
                  <li><a href='https://rutaxplorer.com/contacto/'>{t('contacto')}</a></li>
                  {/* <li><a href='https://checkout.bold.co/payment/LNK_QO3ZYM10UC'>{t('pagos')}</a></li> */}
                  <a className="header-whatsapp" href='https://wa.me/573124151539?text=Hola%20RutaXplorer%2C%20estoy%20interesado%20en%20reservar%20un%20tour.%20¿Podrían%20ayudarme%3F'><h3 ><i className="bi bi-whatsapp"></i> 3124151539</h3></a>
                 
                  {!esMovil && <LanguageSelect />}
                  
                 
                </>
              )}
            </ul>
              </div>
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
                            <Link to={toursUrl}>{t("hero.buttons.reserve")}</Link>
                            
                            
                          </button>

                          <button className="btn-whatsapp-hero">
                            <i className="bi bi-whatsapp"></i>
                            <a href="https://wa.me/573124151539?text=Hola%20RutaXplorer%2C%20estoy%20interesado%20en%20reservar%20un%20tour.%20¿Podrían%20ayudarme%3F" target="_blank" rel="noopener noreferrer">
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



