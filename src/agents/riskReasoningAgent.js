export async function runRiskReasoningAgent({ patient, riskResult, language }) {
  try {
    const response = await fetch("http://localhost:5000/api/risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patient, riskResult, language }),
    });

    const data = await response.json();
    return data.explanation;
  } catch (err) {
    console.error("Risk Reasoning Agent Error:", err);
    return language === "hi"
      ? "जोखिम विश्लेषण अभी उपलब्ध नहीं है।"
      : "Risk explanation is currently unavailable.";
  }
}
