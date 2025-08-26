import { useState } from 'react';
import '../styles/header.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
 import AOS from 'aos';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SelectorIdioma from './language';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
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

    
   

    return (
        <div className="container" data-aos="fade">
         <SelectorIdioma></SelectorIdioma> 
            
          
            <div className="info_header">
                <ul>
                    <li><i className="bi bi-envelope-fill"></i> reservas@rutaxplorer.com</li>
                    <li className='ubication'>{t('siguenos')}:<a href='https://www.facebook.com/people/Rutaxplorer/100090352211763/'><i className="bi bi-facebook"></i> </a> <a href='https://www.instagram.com/ruta.xplorer/'><i className="bi bi-instagram"></i></a> <a href='https://www.youtube.com/@ruta.xplorer/featured'><i className="bi bi-youtube"></i></a>  <a href='https://www.tiktok.com/@ruta.xplorer'><i className="bi bi-tiktok"></i></a></li>
                    <li ><i className="bi bi-geo-alt-fill"></i> <a href='https://www.google.com/maps/place/Salento+ToursRuta.Xplorer+SAS+Transporte+y+turismo/@4.6361604,-75.572946,17z/data=!3m1!4b1!4m6!3m5!1s0x8e388df9d2f6e29d:0x292561140c00b46b!8m2!3d4.6361604!4d-75.572946!16s%2Fg%2F11v496jwg0?entry=ttu&g_ep=EgoyMDI1MDgxOS4wIKXMDSoASAFQAw%3D%3D'>Mz B Casa 1 Barrio La nueva Floresta Salento - Quindío</a> <i className="bi bi-pin-map-fill"></i></li>
                </ul>
            </div>
            <header className="header">
                <div className={`boton ${btnMenu?`voltear`:``} `} onClick={toggleClase}><i className="bi bi-chevron-double-down"></i></div>
                <Link to="https://rutaxplorer.com"><img src='https://rutaxplorer.com/wp-content/uploads/2023/07/RUTA-XPLORER-2-03-1536x717.png'></img></Link>
                  <ul className={`${btnMenu ? 'menu' : ''}`}>
              {menuAdmin ? (
                <>
                  <li><Link to="/admin/reservations">{t('reservas')}</Link></li>
                  <li><Link to="/admin/tours">{t('tours')}</Link></li>
                  <li><Link to="/admin/tours">{t('comentarios')}</Link></li>
                  <h4 className='greeting'>{t('bienvenido')}:<p>{nombre}</p></h4>
                  <button className='close_sesion' onClick={logOut}>{t('cerrar_sesion')}</button>
                </>
              ) : (
                <>
                  <li><a href='https://rutaxplorer.com/'>{t('inicio')}</a></li>
                  <li><a href='https://rutaxplorer.com/nosotros/'>{t('nosotros')}</a></li>
                  <li><a href='https://rutaxplorer.com/servicios/'>{t('servicios')}</a></li>
                  <li><a href='https://rutaxplorer.com/app/'>{t('tours')}</a></li>
                  <li><a href='https://rutaxplorer.com/contacto/'>{t('contacto')}</a></li>
                  <li><a href='https://checkout.bold.co/payment/LNK_QO3ZYM10UC'>{t('pagos')}</a></li>
                  <a href='https://api.whatsapp.com/send?phone=3124151539'><h3 ><i className="bi bi-whatsapp"></i> 3124151539</h3></a>
                  <button href='https://rutaxplorer.com/app/' className='button'>{t('reservar')}</button>
                 
                </>
              )}
            </ul>
                
                
            </header>
        </div>
    )

}

export default Header;



