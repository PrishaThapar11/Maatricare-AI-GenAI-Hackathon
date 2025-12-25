import maternalRiskData from "../data/maternalRiskData.json";

/**
 * Compare patient vitals with dataset rows
 */
function isClose(value, target, tolerance = 5) {
  return Math.abs(Number(value) - Number(target)) <= tolerance;
}

export function calculateRisk({ age, vitals }) {
  if (!age || !vitals) {
    return {
      riskLevel: "unknown",
      reasons: ["Insufficient data"],
      matchedSamples: 0,
    };
  }

  // 1️⃣ Find CSV matches
  const matches = maternalRiskData.filter((row) => {
    return (
      isClose(age, row.Age, 5) &&
      isClose(vitals.SystolicBP, row.SystolicBP, 10) &&
      isClose(vitals.DiastolicBP, row.DiastolicBP, 10) &&
      isClose(vitals.BS, row.BS, 2) &&
      isClose(vitals.BodyTemp, row.BodyTemp, 2) &&
      isClose(vitals.HeartRate, row.HeartRate, 10)
    );
  });

  // 2️⃣ Count CSV risk levels
  const riskCounts = { "high risk": 0, "mid risk": 0, "low risk": 0 };
  matches.forEach((m) => {
    riskCounts[m.RiskLevel.toLowerCase()]++;
  });

  // 3️⃣ Generate rule-based reasons and count abnormal vitals
// 3️⃣ Generate rule-based reasons and count abnormal vitals
const reasons = [];
let abnormalCount = 0;

// ---- BLOOD PRESSURE ----
if (vitals.SystolicBP >= 140 || vitals.DiastolicBP >= 90) {
  reasons.push("High blood pressure (Hypertension)");
  abnormalCount++;
} else if (vitals.SystolicBP < 90 || vitals.DiastolicBP < 60) {
  reasons.push("Low blood pressure (Hypotension)");
  abnormalCount++;
}

// ---- BLOOD SUGAR (mmol/L) ----
if (vitals.BS >= 11) {
  reasons.push("High blood sugar level (Hyperglycemia)");
  abnormalCount++;
} else if (vitals.BS < 3.9) {
  reasons.push("Low blood sugar level (Hypoglycemia)");
  abnormalCount++;
}

// ---- BODY TEMPERATURE (°F) ----
if (vitals.BodyTemp >= 101) {
  reasons.push("Elevated body temperature (Fever)");
  abnormalCount++;
} else if (vitals.BodyTemp < 96) {
  reasons.push("Low body temperature (Hypothermia)");
  abnormalCount++;
}

// ---- HEART RATE (bpm) ----
if (vitals.HeartRate >= 100) {
  reasons.push("High heart rate (Tachycardia)");
  abnormalCount++;
} else if (vitals.HeartRate < 60) {
  reasons.push("Low heart rate (Bradycardia)");
  abnormalCount++;
}

// ---- AGE ----
if (age >= 35) {
  reasons.push("Advanced maternal age");
  abnormalCount++;
} else if (age < 18) {
  reasons.push("Teenage pregnancy");
  abnormalCount++;
}


  // 4️⃣ Decide final riskLevel (more nuanced)
  // Start with CSV dominant risk
  let riskLevel = "low";
  if (riskCounts["high risk"] > 0) riskLevel = "high";
  else if (riskCounts["mid risk"] > 0) riskLevel = "mid";

  // Adjust based on number of abnormal vitals
  if (abnormalCount >= 3) {
    riskLevel = "high";
  } else if (abnormalCount === 2) {
    riskLevel = riskLevel === "low" ? "mid" : riskLevel; // bump low→mid
  } else if (abnormalCount === 1 && riskLevel === "low") {
    riskLevel = "mid"; // single abnormal vital can raise low→mid
  }

  if (reasons.length === 0) reasons.push("Vitals within safe range");

return {
  riskLevel,
  matchedSamples: matches.length,
  vitalsSummary: {
    age: Number(age),
    systolicBP: Number(vitals.SystolicBP),
    diastolicBP: Number(vitals.DiastolicBP),
    bloodSugar: Number(vitals.BS),
    bodyTemp: Number(vitals.BodyTemp),
    heartRate: Number(vitals.HeartRate),
  },
  ruleBasedFindings: reasons.length
    ? reasons
    : ["All vitals currently within clinically safe range"],
};

}
