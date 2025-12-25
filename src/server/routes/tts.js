import express from "express";
import fetch from "node-fetch";


const router = express.Router();
const INWORLD_URL = "https://api.inworld.ai/tts/v1/voice";

// ✅ Split text safely under Inworld limits
function splitText(text, maxLength = 1800) {
  const chunks = [];
  let current = "";

  for (const sentence of text.split(". ")) {
    if ((current + sentence).length > maxLength) {
      chunks.push(current);
      current = sentence;
    } else {
      current += (current ? ". " : "") + sentence;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

router.post("/", async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // ✅ Choose voice based on language
    const voiceId = language === "hi" ? "Priya" : "Priya";

    const textChunks = splitText(text);
    const audioChunks = [];

    for (const chunk of textChunks) {
      const response = await fetch(INWORLD_URL, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${process.env.INWORLD_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: chunk,
          voiceId,
          modelId: "inworld-tts-1"
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("❌ Inworld chunk error:", errText);
        return res.status(500).json({ error: "TTS chunk failed" });
      }

      const result = await response.json();
      audioChunks.push(result.audioContent);
    }

    // ✅ FINAL RESPONSE (array of base64 audio chunks)
    res.json({ audioChunks });

  } catch (err) {
    console.error("❌ Inworld TTS error:", err.message);
    res.status(500).json({ error: "TTS failed" });
  }
});

export default router;

