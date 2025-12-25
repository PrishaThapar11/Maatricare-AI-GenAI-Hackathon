import React from "react";

export default function VoiceOutput({ text, language = "en" }) {
  const speakText = () => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);

    // Language handling
    if (language === "hi") {
      utterance.lang = "hi-IN";
    } else {
      utterance.lang = "en-US";
    }

    window.speechSynthesis.cancel(); // stop any ongoing speech
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={speakText}
      style={{
        padding: "10px 16px",
        backgroundColor: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        marginTop: "10px",
      }}
    >
      🔊 Speak
    </button>
  );
}

