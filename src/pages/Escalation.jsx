import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import LanguageToggle from "../components/common/LanguageToggle";
import AICard from "../components/common/AICard";
import formatAIText from "../utils/temp";
import AISkeleton from "../components/common/AISkeleton";
import { API_BASE_URL } from "../config.js";

export default function Escalation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, aiFindings, language } = useAppContext();

  const patient = patients.find((p) => p.id === id);
  const riskData = aiFindings[id];

  const [escalationPlan, setEscalationPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioRef = useRef(null);
  const stopRef = useRef(false);

  // TTS Functions
  const cleanTextForTTS = (text) => {
    if (!text) return "";
    return text
      .replace(/#{1,6}\s?/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/[-•]/g, "")
      .replace(/[>#]/g, "")
      .replace(/\n+/g, ". ")
      .trim();
  };

  const speakText = async (text) => {
    try {
      setIsSpeaking(true);
      stopRef.current = false;

      const cleanedText = cleanTextForTTS(text);

      const res = await fetch(`${API_BASE_URL}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanedText,
          language,
        }),
      });

      const data = await res.json();

      if (!data.audioChunks || data.audioChunks.length === 0) {
        alert("No audio returned");
        setIsSpeaking(false);
        return;
      }

      for (const chunk of data.audioChunks) {
        if (stopRef.current) break;

        const audioBlob = new Blob(
          [Uint8Array.from(atob(chunk), (c) => c.charCodeAt(0))],
          { type: "audio/mpeg" }
        );

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        await new Promise((resolve) => {
          audio.onended = resolve;
          audio.play();
        });
      }

      setIsSpeaking(false);
    } catch (err) {
      console.error("TTS error:", err);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    stopRef.current = true;
    setIsSpeaking(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  };

  // Fetch Escalation Plan
  useEffect(() => {
    if (!patient || !riskData) return;

    const fetchEscalation = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/escalation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient,
            riskResult: riskData,
            language,
          }),
        });

        const data = await res.json();
        setEscalationPlan(data.escalationPlan);
      } catch (err) {
        setEscalationPlan(
          language === "hi"
            ? "रेफरल जानकारी लोड नहीं हो सकी।"
            : "Failed to load escalation details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEscalation();
  }, [id, language]);

  if (!patient) {
    return <p style={{ padding: 24 }}>Patient not found</p>;
  }

  return (
    <div style={pageStyle}>
      <LanguageToggle />

      <h2>
        {language === "hi"
          ? "रेफरल और एस्केलेशन"
          : "Escalation & Referral"}
      </h2>

      <h3 style={{ color: "#9a3412" }}>{patient.name}</h3>

      <AICard
        title={language === "hi" ? "अनुशंसित कार्रवाई" : "Recommended Action"}
        subtitle={
          language === "hi"
            ? "रोगी की स्थिति के आधार पर"
            : "Based on patient risk condition"
        }
        accent="#f97316"
      >
        {loading ? (
          <AISkeleton lines={6} />
        ) : (
          <>
            <div
              className="ai-content"
              dangerouslySetInnerHTML={{
                __html: formatAIText(escalationPlan),
              }}
            />

            {/* TTS Controls */}
            <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
              {!isSpeaking ? (
                <button
                  style={ttsButton}
                  onClick={() => speakText(escalationPlan)}
                >
                  🔊 {language === "hi" ? "निर्णय सुनें" : "Listen"}
                </button>
              ) : (
                <button
                  style={{ ...ttsButton, background: "#dc2626" }}
                  onClick={stopSpeaking}
                >
                  ⛔ {language === "hi" ? "रोकें" : "Stop"}
                </button>
              )}
            </div>
          </>
        )}
      </AICard>

      <div style={buttonRow}>
        <button onClick={() => navigate(`/patient/${id}/risk`)}>
          {language === "hi" ? "जोखिम विवरण" : "Back to Risk"}
        </button>
        <button onClick={() => navigate(`/patient/${id}/care`)}>
          {language === "hi" ? "देखभाल योजना" : "Care Plan"}
        </button>
        <button onClick={() => navigate("/dashboard")}>
          {language === "hi" ? "डैशबोर्ड" : "Dashboard"}
        </button>
      </div>
    </div>
  );
}

const pageStyle = {
  padding: "24px",
  maxWidth: "900px",
  margin: "auto",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
};

const buttonRow = {
  display: "flex",
  gap: "12px",
  marginTop: "20px",
  flexWrap: "wrap",
};

const ttsButton = {
  background: "#10b981",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: "10px",
  fontWeight: "600",
  cursor: "pointer",
};
