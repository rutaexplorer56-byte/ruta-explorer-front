import { useTranslation } from 'react-i18next';

const SelectorIdioma = () => {
  const { i18n } = useTranslation();

  const cambiarIdioma = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select onChange={cambiarIdioma} defaultValue={i18n.language} className="language">
      <option value="es">🇪🇸 Español</option>
      <option value="en">🇺🇸 English</option>
    </select>
  );
};

export default SelectorIdioma;