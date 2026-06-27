const BOLD_SCRIPT_ID = "bold-checkout-script";
const BOLD_SCRIPT_URL = "https://checkout.bold.co/library/boldPaymentButton.js";

export const cargarScriptBold = () => {
  return new Promise((resolve, reject) => {
    const scriptExistente = document.getElementById(BOLD_SCRIPT_ID);

    if (scriptExistente) {
      if (window.BoldCheckout) {
        resolve();
        return;
      }

      scriptExistente.onload = () => resolve();
      scriptExistente.onerror = () =>
        reject(new Error("No se pudo cargar Bold Checkout"));

      return;
    }

    const script = document.createElement("script");
    script.id = BOLD_SCRIPT_ID;
    script.src = BOLD_SCRIPT_URL;
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("No se pudo cargar Bold Checkout"));

    document.body.appendChild(script);
  });
};

export const abrirBoldCheckout = async ({
  apiKey,
  reference,
  amount,
  currency = "COP",
  signature,
  description,
  redirectionUrl,

}) => {
  await cargarScriptBold();

  if (!window.BoldCheckout) {
    throw new Error("BoldCheckout no está disponible.");
  }

  const checkout = new window.BoldCheckout({
    apiKey,
    orderId: reference,
    reference,
    amount: String(amount),
    currency,
    integritySignature: signature,
    description,
    redirectionUrl,

  });

  checkout.open();
};