import { useEffect } from "react";

/* eslint-disable react/prop-types */
const BotonBold = ({reference ,amount ,currency ,api ,signature}) => {

 
  useEffect(() => {
    const boldScriptId = "bold-checkout-script";
    const existingScript = document.getElementById(boldScriptId);
    const user={
      email: "",
      fullName: ""
    }

    

  

    // 1. Cargar la librería principal de Bold si no está
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://checkout.bold.co/library/boldPaymentButton.js";
      script.async = true;
      script.id = boldScriptId;
      document.body.appendChild(script);
    }

    // 2. Crear el script del botón (sin src)
    const buttonScript = document.createElement("script");
    buttonScript.setAttribute("data-bold-button", "");
    buttonScript.setAttribute("data-api-key", api.toString()); // ✅ Aquí ya se usa bien
    buttonScript.setAttribute("data-reference", reference);
    buttonScript.setAttribute("data-amount", amount.toString());
    buttonScript.setAttribute("data-currency", currency);
    buttonScript.setAttribute("costumer-data", user);
    buttonScript.setAttribute("data-order-id", reference);
    buttonScript.setAttribute("data-integrity-signature", signature);
    buttonScript.setAttribute("data-redirection-url", "https://rutaxplorer.com/app/invoice/");
     
    buttonScript.async = true;

    const container = document.getElementById("bold-button-container");

    if (container) {
      container.innerHTML = ""; // Limpiar antes de agregar
      container.appendChild(buttonScript);
      window.BoldPaymentButton?.mount();
    }
    

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [reference,amount,currency,api,signature]);
        

  return <div id="bold-button-container" />;
};

export default BotonBold;
