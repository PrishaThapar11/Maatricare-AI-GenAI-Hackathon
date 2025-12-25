import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import LanguageToggle from "../components/common/LanguageToggle";
import AICard from "../components/common/AICard";
import formatAIText from "../utils/temp";
import AISkeleton from "../components/common/AISkeleton";

function getRiskBadge(riskLevel = "") {
  const level = riskLevel.toLowerCase();

  if (level === "high") {
    return { label: "HIGH", color: "#dc2626", bg: "#fee2e2" };
  }
  if (level === "medium" || level === "mid") {
    return { label: "MEDIUM", color: "#d97706", bg: "#fef3c7" };
  }
  return { label: "LOW", color: "#15803d", bg: "#dcfce7" };
}

export default function RiskExplanation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, aiFindings, language } = useAppContext();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);
  const stopRef = useRef(false);

  const patient = patients.find((p) => p.id === id);
  const aiData = aiFindings[id];

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

      const res = await fetch("http://localhost:5000/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanedText }),
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

  if (!patient || !aiData) {
    return (
      <p style={{ padding: 24 }}>
        {language === "hi" ? "डेटा उपलब्ध नहीं है" : "Data not available"}
      </p>
    );
  }

  const riskBadge = getRiskBadge(aiData.riskLevel);

  return (
    <div style={pageStyle}>
      <LanguageToggle />

      <h2>{language === "hi" ? "जोखिम मूल्यांकन" : "Risk Assessment"}</h2>
      <h3 style={{ color: "#9d174d" }}>{patient.name}</h3>

      <AICard
        title={language === "hi" ? "जोखिम सारांश" : "Risk Summary"}
        accent={riskBadge.color}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: riskBadge.bg,
            color: riskBadge.color,
            padding: "8px 14px",
            borderRadius: "999px",
            fontWeight: 600,
            marginBottom: "12px",
          }}
        >
          ⚠️ {riskBadge.label} RISK
        </div>

        <p>
          <strong>{language === "hi" ? "मुख्य कारण" : "Key Reasons"}:</strong>
        </p>

        <ul>
          {aiData.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>

        <p style={{ fontSize: "12px", color: "#6b7280" }}>
          {language === "hi"
            ? `मिलते-जुलते केस: ${aiData.matchedSamples}`
            : `Matched samples: ${aiData.matchedSamples}`}
        </p>
      </AICard>

      <AICard
        title={
          language === "hi"
            ? "एआई द्वारा समझाया गया जोखिम"
            : "AI Risk Explanation"
        }
        subtitle={
          language === "hi"
            ? "यह स्पष्टीकरण स्वास्थ्य कार्यकर्ता के लिए है"
            : "Generated to assist the ASHA worker"
        }
        accent="#f59e0b"
      >
        {!aiData.explanation ? (
          <AISkeleton lines={6} />
        ) : (
          <>
            <div
              className="ai-content"
              dangerouslySetInnerHTML={{
                __html: formatAIText(aiData.explanation),
              }}
            />

            {/* TTS Controls */}
            <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
              {!isSpeaking ? (
                <button
                  style={ttsButton}
                  onClick={() => speakText(aiData.explanation)}
                >
                  🔊 {language === "hi" ? "सुनें" : "Listen"}
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
        <button onClick={() => navigate(`/patient/${id}/care`)}>
          {language === "hi" ? "देखभाल योजना" : "Care Plan"}
        </button>
        <button onClick={() => navigate(`/patient/${id}/escalation`)}>
          {language === "hi" ? "रेफरल" : "Escalation"}
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
  background: "linear-gradient(135deg, #fde7f3, #fff1f2)",
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