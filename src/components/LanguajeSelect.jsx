import { useTranslation } from "react-i18next";
import "../styles/languageSelect.css";
const normalizeLang = (lng) => (lng || "es").split("-")[0];

export default function LanguageSelect() {
  const { i18n } = useTranslation();
  const current = normalizeLang(i18n.language);

  const changeLang = (lang) => {
    if (lang === current) return;
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  return (
    <div className="language-switch">
      <button
        className={`flag flag-es ${current === "es" ? "active" : ""}`}
        onClick={() => changeLang("es")}
        aria-label="Español"
      />

      <button
        className={`flag flag-en ${current === "en" ? "active" : ""}`}
        onClick={() => changeLang("en")}
        aria-label="English"
      />

      <button
        className={`flag flag-fr ${current === "fr" ? "active" : ""}`}
        onClick={() => changeLang("fr")}
        aria-label="Français"
      />
    </div>
  );
}