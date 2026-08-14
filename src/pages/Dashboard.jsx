import { useState, useref } from "react";
import { useAppContext } from "../context/AppContext";
import AddPatient from "./AddPatient";
import PatientView from "./PatientView";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


import LanguageToggle from "../components/common/LanguageToggle";
import { calculateRisk } from "../utils/riskCalculator";
import RiskBadge from "../components/RiskBadge";
import { API_BASE_URL } from "../config.js";

export default function Dashboard() {
    const {
    user,
    patients,
    addPatient,
    updatePatient,
    aiFindings,
    updateAIFindings,
    t,
    language,
  } = useAppContext();
  const navigate = useNavigate();
  useEffect(() => {
  if (!user) {
    navigate("/login");
  }
}, [user]);

  



  
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

 const handleSelectPatient = (patientId) => {
  setSelectedPatientId(patientId);
};
const selectedPatient = selectedPatientId 
  ? patients.find(p => p.id === selectedPatientId)
  : null;

  const handleRunAI = async (patient) => {
    const latestRecord = patient.records?.[patient.records.length - 1];
    if (!latestRecord) return alert("No records to analyze!");

    try {
      setLoadingAI(true);

      const riskResult = calculateRisk({
        age: patient.age,
        vitals: latestRecord.vitals,
      });
      if (riskResult.riskLevel === "high") {
  alert(
    language === "hi"
      ? "⚠️ उच्च जोखिम गर्भावस्था! तुरंत चिकित्सीय ध्यान आवश्यक।"
      : "⚠️ High-risk pregnancy detected! Immediate medical attention required."
  );
}


      const response = await fetch(`${API_BASE_URL}/api/risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient, riskResult, language }),
      });

      const data = await response.json();

      updateAIFindings(patient.id, {
        riskLevel: riskResult.riskLevel,
        matchedSamples: riskResult.matchedSamples,
        reasons: riskResult.ruleBasedFindings,
        explanation: data.explanation,
      });

      navigate(`/patient/${patient.id}/risk`);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.appTitle}>MaatriCare AI</h1>
          <p style={styles.subtitle}>
            {language === "hi"
              ? "एआई आधारित मातृत्व स्वास्थ्य डैशबोर्ड"
              : "AI-powered maternal health dashboard"}
          </p>
        </div>
        <LanguageToggle />
      </div>

      {/* HERO */}
      <div style={styles.hero}>
        <div style={styles.welcomeRow}>
          <span style={styles.welcomeText}>
            🌸 {t.welcome},
          </span>

<span style={styles.userName}>
  {user?.name}
</span>


        </div>

        <p style={styles.heroSub}>
          {language === "hi"
            ? "मरीजों को ट्रैक करें, जोखिम का आकलन करें और देखभाल की योजना बनाएं"
            : "Track patients, assess risks & plan care"}
        </p>
      </div>

      {/* STATS */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{patients.length}</div>
          <div style={styles.statLabel}>
            {language === "hi" ? "कुल मरीज" : "Total Patients"}
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {
              Object.values(aiFindings).filter(
                (a) => a?.riskLevel === "high"
              ).length
            }
          </div>
          <div style={styles.statLabel}>
            {language === "hi" ? "उच्च जोखिम" : "High Risk"}
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {Object.keys(aiFindings).length}
          </div>
          <div style={styles.statLabel}>
            {language === "hi" ? "एआई रिपोर्ट" : "AI Reports"}
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={styles.grid}>
        {/* LEFT */}
        <div>
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>
              ➕ {language === "hi" ? "मरीज पंजीकरण" : "Register Patient"}
            </h3>
            <AddPatient onSave={addPatient} />
          </div>

          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>
              👩‍⚕️ {language === "hi" ? "मरीज" : "Patients"}
            </h3>

            {patients.map((p) => (
              <div key={p.id} style={styles.patientRow}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <strong>{p.name}</strong>
                    {aiFindings[p.id] && (
                      <RiskBadge level={aiFindings[p.id].riskLevel} />
                    )}
                  </div>
                  <div style={styles.subText}>
                    {language === "hi" ? "आयु" : "Age"}: {p.age}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    style={styles.secondaryBtn}
                    onClick={() => handleSelectPatient(p.id)}
                  >
                    {language === "hi" ? "देखें" : "View"}
                  </button>

                  <button
                    style={styles.primaryBtn}
                    onClick={() => handleRunAI(p)}
                    disabled={loadingAI}
                  >
                    {language === "hi" ? "जोखिम आकलन" : "Assess Risk"}
                  </button>

                  {/* Show Care/Escalation only AFTER risk is calculated */}
                  {aiFindings[p.id] && (
                    <>
                      <button
                        style={styles.secondaryBtn}
                        onClick={() => navigate(`/patient/${p.id}/care`)}
                      >
                        {language === "hi" ? "देखभाल" : "Care Plan"}
                      </button>

                      <button
                        style={styles.secondaryBtn}
                        onClick={() => navigate(`/patient/${p.id}/escalation`)}
                      >
                        {language === "hi" ? "रेफरल" : "Escalation"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div style={styles.card}>
            {selectedPatient ? (
              <>
                <h3 style={styles.sectionTitle}>
                  📋 {language === "hi" ? "मरीज विवरण" : "Patient Overview"}
                </h3>
            <PatientView
  patient={selectedPatient}
  aiFindings={aiFindings[selectedPatientId]}
/>
              </>
            ) : (
              <p style={styles.empty}>
                {language === "hi"
                  ? "जानकारी देखने के लिए मरीज चुनें"
                  : "Select a patient to view insights"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    padding: 28,
    background: "linear-gradient(135deg, #f3b6cf, #f8cdda)",
    fontFamily: "Inter, sans-serif",
  },

  header: {
    background: "linear-gradient(90deg, #ec407a, #ab47bc)",
    padding: "24px 28px",
    borderRadius: 20,
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  appTitle: { margin: 0, fontSize: 28 },
  subtitle: { margin: 0, opacity: 0.9 },

  hero: {
    marginTop: 20,
    padding: 20,
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  },

  welcomeRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  welcomeText: {
    fontSize: 20,
    fontWeight: 600,
    color: "#db2777",
  },

  userName: {
    fontSize: 22,
    fontWeight: 700,
    color: "#7c2d12",
    background: "#fce7f3",
    padding: "4px 10px",
    borderRadius: 999,
  },

  heroSub: {
    fontSize: 14,
    marginTop: 6,
    color: "#666",
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 18,
    marginTop: 22,
  },

  statCard: {
    background: "#fff",
    padding: "22px 10px",
    borderRadius: 18,
    textAlign: "center",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  },

  statNumber: {
    fontSize: 28,
    fontWeight: 700,
    color: "#ab47bc",
    marginBottom: 6,
  },

  statLabel: {
    fontSize: 14,
    color: "#666",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.4fr",
    gap: 24,
    marginTop: 26,
  },

  card: {
    background: "#fff",
    padding: 22,
    borderRadius: 20,
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
    marginBottom: 20,
  },

  sectionTitle: {
    color: "#ab47bc",
    marginBottom: 16,
  },

  patientRow: {
    padding: 12,
    borderRadius: 14,
    background: "#fdf3f7",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  subText: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },

  empty: { textAlign: "center", color: "#888" },

  primaryBtn: {
    background: "linear-gradient(135deg, #ec407a, #ab47bc)",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer",
  },

  secondaryBtn: {
    background: "#fce4ec",
    color: "#c2185b",
    border: "1px solid #f8bbd0",
    padding: "8px 14px",
    borderRadius: 10,
    cursor: "pointer",
  },
};







