import "../styles/footer.css"
import AOS from 'aos';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function Footer() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const { t } = useTranslation();

  return (
    <>
      <svg data-aos="fade" className="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#17223A" d="M0,192L720,96L1440,192L1440,320L720,320L0,320Z"></path></svg>
      <footer className="footer" data-aos="fade">
        <div className="logo">
          <img src="https://rutaxplorer.com/wp-content/uploads/2023/07/RUTA-XPLORER-2-02-859x1024.png" alt="Ruta Xplorer" />
          <div className="logos">
            <i className="bi bi-facebook"></i>
            <i className="bi bi-whatsapp"></i>
            <i className="bi bi-instagram"></i>
            <i className="bi bi-youtube"></i>
            <i className="bi bi-tiktok"></i>
          </div>
        </div>

        <div className="menu">
          <h2>{t('menu')}</h2>
          <ul>
            <li>{t('inicio')}</li>
            <li>{t('nosotros')}</li>
            <li>{t('servicios')}</li>
            <li>{t('tours')}</li>
            <li>{t('contacto')}</li>
            <li>{t('pagos')}</li>
          </ul>
        </div>

        <div className="contacto">
          <h2>{t('contacto')}</h2>
          <ul>
            <li>{t('direccion')}</li>
            <li>{t('correos')}</li>
            <li>{t('telefonos')}</li>
          </ul>
          <h2>{t('politicas')}</h2>
          <ul>
            <li>{t('privacidad')}</li>
            <li>{t('terminos')}</li>
          </ul>
        </div>

        <div className="noticias">
          <h2>{t('boletin')}</h2>
          <h4>{t('mensaje_boletin')}</h4>
          <input placeholder={t('correo')} />
          <br />
          <button>{t('suscribirme')}</button>
        </div>
      </footer>

      <div className="derechos">
        <p>{t('derechos')}</p>
        <p>NIT. 901.809.373</p>
        <p>RNT. 167269</p>
      </div>
    </>
  );
}

export default Footer;