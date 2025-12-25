import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ttsRoutes from "./routes/tts.js";
import scanReportRoutes from "./routes/scanReport.js";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import patientRoutes from "./routes/patients.js"; 


connectDB();





dotenv.config();
// ✅ Add these debug logs
console.log("🔑 GEMINI_API_KEY exists?", !!process.env.GEMINI_API_KEY);
console.log("🔑 ELEVENLABS_API_KEY exists?", !!process.env.ELEVENLABS_API_KEY);
console.log("🔑 ELEVENLABS_API_KEY first 10 chars:", process.env.ELEVENLABS_API_KEY?.substring(0, 10));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const app = express();
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

app.use(cors());
app.use(express.json());
app.use("/api/tts", ttsRoutes);
app.use("/api/scan-report", scanReportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);



app.post("/api/risk", async (req, res) => {
  const { patient, riskResult, language, visitContext } = req.body;
  console.log("📅 Visit Context received:", visitContext);

  
  try {
    console.log("🔵 Request received for patient:", patient?.name);
const prompt = `
You are an AI clinical decision-support assistant designed to help ASHA workers in India.

IMPORTANT:
- You are speaking ONLY to the ASHA worker, NOT to the patient.
- Your role is to explain the situation clearly so the ASHA worker can take correct action.
- Be empathetic and reassuring, but professional.
- Do NOT directly address the patient.
- Avoid fear-based language.
- Use simple, non-technical terms suitable for community health workers.
- Be structured and actionable.

Language: ${language === "hi" ? "Hindi" : "English"}

PATIENT SUMMARY (for ASHA reference):
- Age: ${patient.age}
- Current pregnancy month: ${patient.records?.at(-1)?.pregnancyMonth}
- Reported symptoms: ${patient.records?.at(-1)?.symptoms || "None"}

RISK ENGINE OUTPUT:
- Overall risk level: ${riskResult.riskLevel}
- Matched historical samples: ${riskResult.matchedSamples}

Identified contributing factors:
${riskResult.ruleBasedFindings.map((r) => `- ${r}`).join("\n")}

TASK:
Explain the situation to the ASHA worker using the following structure:

1. Overall Assessment  
   - What the risk level means in simple terms
   - Whether the situation is immediately dangerous or manageable

2. Key Risk Factors  
   - Briefly explain each contributing factor
   - Why it matters during pregnancy

3. Guidance for the ASHA Worker  
   - Be brief
   - What should be monitored regularly
   - What lifestyle or care points should be reinforced
   - What signs would require closer attention

4. Reassurance  
   - Clearly state that many such cases can be managed well with timely care
   - Encourage calm, regular follow-up

Keep the tone calm, respectful, and supportive.
`;


    // ✅ Use gemini-2.0-flash (or gemini-2.5-flash or gemini-1.5-flash)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ Gemini response received!");
    res.json({ explanation: text });
    
  } catch (err) {
    console.error("❌ Risk Reasoning Agent Error:", err);
    console.error("❌ Error message:", err.message);
    
    res.status(500).json({
      explanation: language === "hi"
        ? "एआई सीमा तक पहुंच गया है। कृपया कुछ समय बाद पुनः प्रयास करें। अभी नियम-आधारित जोखिम मान्य है।"
        : "AI quota reached. Please retry later. Rule-based risk assessment remains valid",
    });
  }
});
app.post("/api/care", async (req, res) => {
  const { patient, riskResult, language, visitContext } = req.body;


  try {
    console.log("🟢 Care Plan request for:", patient?.name);

    const latestRecord = patient.records?.at(-1);
    const region = visitContext?.region || "Unknown region";
const visitDate = visitContext?.date || "Unknown date";


    const prompt = `
You are a maternal health care planning assistant for ASHA workers in India.

Your role:
- Explain care steps to the ASHA worker (NOT directly to the patient)
- Be empathetic, calm, and practical
- Focus on nutrition, daily care, and monitoring
- Avoid medical jargon
- Be culturally appropriate for rural India
- Don't make the answer TOO long

Language: ${language === "hi" ? "Hindi" : "English"}

Patient Details:
Age: ${patient.age}
Pregnancy Month: ${latestRecord?.pregnancyMonth}

Patient Region: ${region}
Visit Date: ${visitDate}


Symptoms: ${latestRecord?.symptoms || "None"}
Vitals:
- Blood Pressure: ${latestRecord?.vitals?.bp || "N/A"}
- Heart Rate: ${latestRecord?.vitals?.hr || "N/A"}

Risk Summary:
Risk Level: ${riskResult.riskLevel}
Reasons:
${riskResult.ruleBasedFindings?.map(r => `- ${r}`).join("\n")}

Instructions:
1. Explain what kind of care is needed at this stage
2. Give a simple nutrition plan for breakfast, lunch,snacks,dinner (preferably local Indian foods)
3. Consider seasonal foods based on visit date
4. Use regionally available Indian foods
5. Avoid generic Western diets
6. Suggest daily care & rest practices
7. Mention warning signs ASHA should watch for
8. Keep tone supportive and reassuring
9. Address the ASHA worker directly
10. Don't make it very long and boring to read
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ carePlan: text });

  } catch (err) {
    console.error("❌ Care Plan Agent Error:", err);

    res.status(500).json({
      carePlan:
        language === "hi"
          ? "एआई सीमा तक पहुंच गया है। कृपया कुछ समय बाद पुनः प्रयास करें। अभी नियम-आधारित जोखिम मान्य है।"
        : "AI quota reached. Please retry later. AI-backed personalized care and nutrition plan feature remains valid",
    });
  }
});
app.post("/api/escalation", async (req, res) => {
  const { patient, riskResult, language, visitContext } = req.body;


  try {
    console.log("🟠 Escalation request for:", patient?.name);

    const latestRecord = patient.records?.at(-1);

    const reasons =
      riskResult?.reasons ||
      riskResult?.ruleBasedFindings ||
      [];

    const prompt = `
You are an AI escalation and referral decision assistant for ASHA workers in India.

IMPORTANT RULES:
- Speak ONLY to the ASHA worker
- Do NOT address the patient directly
- Be calm, clear, and practical
- Avoid long explanations
- Focus on decision-making
- Do NOT use fear-based language

Language: ${language === "hi" ? "Hindi" : "English"}

PATIENT SUMMARY:
- Age: ${patient.age}
- Pregnancy month: ${latestRecord?.pregnancyMonth}
- Symptoms: ${latestRecord?.symptoms || "None"}

VITAL SIGNS:
- Blood Pressure: ${latestRecord?.vitals?.bp || "N/A"}
- Heart Rate: ${latestRecord?.vitals?.hr || "N/A"}

RISK ENGINE OUTPUT:
- Risk Level: ${riskResult.riskLevel}
- Matched Samples: ${riskResult.matchedSamples}

Identified Risk Factors:
${reasons.map(r => `- ${r}`).join("\n")}

TASK:
Based on BOTH:
1. Rule-based risk indicators
2. Overall clinical judgment

Provide escalation guidance using EXACTLY this format:

Escalation Decision: YES / NO / MONITOR CLOSELY

Reasoning:
- Short bullet points (max 3)

Recommended Action for ASHA Worker:
- Practical next steps (max 3)

Referral Level (if applicable):
- PHC / CHC / District Hospital / Not required

Urgency:
- Immediate / Within 24–48 hours / Routine follow-up

Reassurance Note:
- One calm and supportive sentence

Keep response concise, structured, and actionable.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ escalationPlan: text });

  } catch (err) {
    console.error("❌ Escalation Agent Error:", err);

    res.status(500).json({
      escalationPlan:
        language === "hi"
          ? "एआई सीमा तक पहुंच गया है। कृपया कुछ समय बाद पुनः प्रयास करें। अभी रेफरल निर्णय मान्य है।"
        : "AI quota reached. Please retry later. Escalation and Referral agent remains valid",
    });
  }
});





app.listen(5000, () => console.log("✅ AI backend running on http://localhost:5000"));



