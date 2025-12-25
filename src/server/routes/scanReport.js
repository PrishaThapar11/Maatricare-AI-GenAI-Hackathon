import express from "express";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function normalizeVitals(vitals) {
  const normalized = { ...vitals };

  // 🌡️ Temperature: C → F
  if (vitals.BodyTemp?.value != null) {
    if (vitals.BodyTemp.unit === "C") {
      normalized.BodyTemp = {
        value: +(vitals.BodyTemp.value * 9/5 + 32).toFixed(1),
        unit: "F"
      };
    }
  }

  // 🩸 Blood Sugar: mg/dL → mmol/L
  if (vitals.BS?.value != null) {
    if (vitals.BS.unit === "mg/dL") {
      normalized.BS = {
        value: +(vitals.BS.value / 18).toFixed(1),
        unit: "mmol/L"
      };
    }
  }

  return normalized;
}

router.post("/", upload.single("report"), async (req, res) => {
  try {
    // 1️⃣ Validate file
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📄 Processing uploaded file:", req.file.originalname);

    // 2️⃣ Read uploaded file
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const base64File = fileBuffer.toString("base64");

    // 3️⃣ Gemini prompt
    const prompt = `
You are a medical report data extraction system for ASHA workers in India.

The uploaded file may be:
- Printed OR handwritten
- In English OR Hindi OR mixed language

Your task:
Extract patient details and vitals EXACTLY as written.
DO NOT guess or infer missing values.

-------------------------
OUTPUT FORMAT (STRICT)
-------------------------
Return ONLY valid JSON in this EXACT format (no markdown, no code fences, no explanations):

{
  "patientName": string | null,
  "age": number | null,
  "pregnancyMonth": number | null,
  "region": string | null,

  "vitals": {
    "SystolicBP": number | null,
    "DiastolicBP": number | null,
    "BS": {
      "value": number | null,
      "unit": "mmol/L" | "mg/dL" | null
    },
    "BodyTemp": {
      "value": number | null,
      "unit": "F" | "C" | null
    },
    "HeartRate": number | null
  },

  "symptoms": string | null,
  "language": "english" | "hindi" | "mixed" | null,
  "confidence": "high" | "medium" | "low"
}

-------------------------
IMPORTANT RULES
-------------------------
- Blood Pressure MUST be split into systolic and diastolic
- Blood Sugar:
  • mmol/L preferred
  • If mg/dL, keep unit explicitly
- Temperature:
  • Keep original unit (C or F)
- If report is in Hindi, extract values AND symptoms in Hindi
- If handwriting is unclear, set confidence = "low"
- If value not found, return null
- DO NOT add explanations
- DO NOT wrap in markdown code blocks
- DO NOT add any text before or after the JSON
- ONLY return the raw JSON object
`;

    // 4️⃣ Call Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64File,
          mimeType: req.file.mimetype,
        },
      },
      prompt,
    ]);

    const text = result.response.text();
    console.log("📝 Raw Gemini response:", text.substring(0, 200) + "...");

    // 5️⃣ Parse JSON safely - strip markdown fences first
    let parsed;
    try {
      // ✅ Remove markdown code fences if present
      const cleanedText = text
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      
      parsed = JSON.parse(cleanedText);
      console.log("✅ Successfully parsed JSON");
    } catch (err) {
      console.error("❌ Invalid JSON from Gemini:", text);
      return res.status(500).json({ error: "Invalid AI output", rawResponse: text });
    }

    // 6️⃣ Cleanup uploaded file
    fs.unlinkSync(filePath);

    // 7️⃣ Normalize vitals and send
    parsed.vitals = normalizeVitals(parsed.vitals);
    
    console.log("✅ Sending extracted data to frontend");
    res.json(parsed);

  } catch (err) {
    console.error("❌ Report Scan Error:", err);
    res.status(500).json({ error: "Report scanning failed", details: err.message });
  }
});

export default router;

