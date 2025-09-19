import { useEffect } from "react";
import "../styles/header.css";
const GoogleTranslate = () => {
  useEffect(() => {
    // Definir la función global que Google necesita
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "es", // idioma original
          includedLanguages: "en,fr,de,it,pt", // idiomas que permites
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
    };

    // Insertar el script de Google si no está cargado
    const scriptId = "google-translate-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    }
  }, []);

  return <div className="language" id="google_translate_element" />;
};

export default GoogleTranslate;