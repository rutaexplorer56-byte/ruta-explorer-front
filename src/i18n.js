import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const resources = {
  es: {
    translation: {
      incluido: "Incluido",
      guia: "Guía turístico local experto",
      almuerzo: "Almuerzo",
      transporte: "Transporte",
      snacks: "Snacks",
      reservar: "Reservar",
      fecha: "Fecha",
      hora: "Horario",
      adultos: "Adultos",
      seleccionar_horario: "Selecciona un horario",
      vendido_por: "Vendido por:",
      total: "Total",
      acerca: "Acerca de este tour:",reservas: "Reservas",
    tours: "Tours",
    comentarios: "Comentarios",
    bienvenido: "Bienvenido",
    cerrar_sesion: "Cerrar sesión",
    inicio: "Inicio",
    nosotros: "Nosotros",
    servicios: "Servicios",
    contacto: "Contacto",
    pagos: "Pagos en Línea",
    siguenos:"Síguenos",
       menu: "Menú",
    direccion: "Mz B Casa 1 Barrio La nueva Floresta, Salento - Quindío Piso 1",
    correos: "reservas@rutaxplorer.com, administracion@rutaxplorer.com, ventas@rutaxplorer.com",
    telefonos: "+573124151539, +573205056344",
    politicas: "Políticas",
    privacidad: "Políticas de privacidad",
    terminos: "Términos y condiciones",
    boletin: "Boletín de Noticias",
    mensaje_boletin: "Suscríbete y recibe novedades y promociones",
    correo: "Correo Electrónico",
    suscribirme: "Suscribirme",
    derechos: "2023 © Todos los derechos reservados  ruta.xplorer Transporte y Turismo s.a.s",
        acerca_titulo: "Acerca de este tour:",
    acerca_texto: `A la hora indicada nos encontraremos en la iglesia Nuestra Señora del Carmen y desde ahí nos trasladaremos hasta el punto del valle del Cocora en el que iniciaremos esta ruta de senderismo. Una vez allí, empezaremos a caminar por los senderos esta espectacular zona colombiana. Pasaremos por la truchera, un famoso cultivo de truchas local, mientras admiramos la belleza del paisaje y sus imponentes palmas de cera.

Cruzaremos el bosque del Parque Nacional Natural los Nevados hasta llegar a la Reserva Acaime, donde apreciaremos 5 puentes colgantes que atraviesan una quebrada y seremos testigos de la diversidad de fauna y flora colombiana.

En un punto de los alrededores, haremos una breve parada para degustar un rico chocolate caliente o una bebida típica de aguapanela con un trozo de queso. Aprovecharemos este pequeño descanso para contaros la historia de este bonito paraje natural.`
 

    }
  },
  en: {
    translation: {
      incluido: "Included",
      guia: "Local expert tour guide",
      almuerzo: "Lunch",
      transporte: "Transport",
      snacks: "Snacks",
      reservar: "Book now",
      fecha: "Date",
      hora: "Time",
      adultos: "Adults",
      seleccionar_horario: "Select a time",
      vendido_por: "Sold by:",
      total: "Total",
      acerca: "About this tour:",
      reservas: "Reservations",
    tours: "Tours",
    comentarios: "Comments",
    bienvenido: "Welcome",
    cerrar_sesion: "Log out",
    inicio: "Home",
    nosotros: "About us",
    servicios: "Services",
    contacto: "Contact",
    pagos: "Online Payment",
    siguenos:"Follow us",
     menu: "Menu",
    direccion: "Block B House 1, La Nueva Floresta, Salento - Quindío, 1st Floor",
    correos: "reservas@rutaxplorer.com, administracion@rutaxplorer.com, ventas@rutaxplorer.com",
    telefonos: "+573124151539, +573205056344",
    politicas: "Policies",
    privacidad: "Privacy Policy",
    terminos: "Terms and Conditions",
    boletin: "Newsletter",
    mensaje_boletin: "Subscribe and receive news and promotions",
    correo: "Email",
    suscribirme: "Subscribe",
    derechos: "2023 © All rights reserved  ruta.xplorer Transporte y Turismo s.a.s",
        acerca_titulo: "About this tour:",
    acerca_texto: `At the scheduled time, we will meet at the church Nuestra Señora del Carmen and from there we will be transported to the Cocora Valley, where we will begin our hiking route. Once there, we will walk along the trails of this spectacular Colombian area. We will pass by the trout farm, a famous local trout facility, while admiring the beauty of the landscape and its towering wax palms.

We will cross the forest of Los Nevados National Natural Park until we reach the Acaime Reserve, where we will see 5 hanging bridges over a stream and witness the diversity of Colombian flora and fauna.

At one of the surrounding points, we will make a short stop to enjoy a hot chocolate or a traditional drink of aguapanela with a piece of cheese. We will take this short break to tell you the story of this beautiful natural setting.`
 
    }
  }
};




i18n.use(initReactI18next).init({
  resources,
  lng: 'es', // idioma por defecto
  fallbackLng: 'es',
  interpolation: { escapeValue: false }
});

export default i18n;