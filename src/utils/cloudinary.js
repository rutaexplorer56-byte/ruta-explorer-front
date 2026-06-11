export const optimizarImagenCloudinary = (url, width = 800) => {
  if (!url) return "";

  if (!url.includes("res.cloudinary.com")) return url;

  const transformacion = `f_auto,q_auto,w_${width},c_limit`;

  return url.replace("/upload/", `/upload/${transformacion}/`);
};