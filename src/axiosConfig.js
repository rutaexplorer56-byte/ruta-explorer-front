import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// ✅ agrega lang automáticamente a TODAS las requests
axios.interceptors.request.use((config) => {
  const lang = (localStorage.getItem("lang") || "es").split("-")[0];

  config.params = config.params || {};
  // no pisar si ya viene lang manual
  if (!config.params.lang) {
    config.params.lang = lang;
  }

  return config;
});

export default axios;
