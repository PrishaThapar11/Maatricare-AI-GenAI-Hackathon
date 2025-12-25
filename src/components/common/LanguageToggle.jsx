// src/components/common/LanguageToggle.jsx
import { useAppContext } from "../../context/AppContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useAppContext();

  const handleChange = (lang) => {
    setLanguage(lang);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <button
        onClick={() => handleChange("en")}
        disabled={language === "en"}
        style={{
          marginRight: "8px",
          padding: "6px 12px",
          backgroundColor: language === "en" ? "#ccc" : "#007bff",
          color: language === "en" ? "#333" : "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: language === "en" ? "default" : "pointer",
        }}
      >
        English
      </button>

      <button
        onClick={() => handleChange("hi")}
        disabled={language === "hi"}
        style={{
          padding: "6px 12px",
          backgroundColor: language === "hi" ? "#ccc" : "#28a745",
          color: language === "hi" ? "#333" : "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: language === "hi" ? "default" : "pointer",
        }}
      >
        हिन्दी
      </button>
    </div>
  );
}


