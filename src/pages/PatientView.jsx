import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import VoiceOutput from "../components/voice/VoiceOutput";

export default function PatientView({ patient, aiFindings }) {
  const { t, updatePatient, language } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);

  if (!patient) return null;

  const latestRecord = patient.records?.[patient.records.length - 1];
  const aiData = aiFindings || {};

  const [editedName, setEditedName] = useState(patient.name);
  const [editedAge, setEditedAge] = useState(patient.age);

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.name}>{patient.name}</h3>
          <span style={styles.ageChip}>
            {language === "hi" ? "आयु" : "Age"}: {patient.age}
          </span>
        </div>

        <button
          style={styles.editBtn}
          onClick={() => setIsEditing(!isEditing)}
        >
          ✏️ {language === "hi" ? "संपादित करें" : "Edit"}
        </button>
      </div>

      {/* EDIT MODE */}
      {isEditing && (
        <div style={styles.editBox}>
          <input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            placeholder={t.patientName}
            style={styles.input}
          />
          <input
            value={editedAge}
            onChange={(e) => setEditedAge(e.target.value)}
            placeholder={t.patientAge}
            style={styles.input}
          />

          <div style={{ marginTop: 8 }}>
            <button
              style={styles.primaryBtn}
              onClick={() => {
                updatePatient(patient.id, {
                  name: editedName,
                  age: editedAge,
                });
                setIsEditing(false);
              }}
            >
              Save
            </button>

            <button
              style={styles.secondaryBtn}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MEDICAL DETAILS */}
      {latestRecord ? (
        <>
          {/* VISIT INFO */}
          <div style={styles.infoRow}>
            <div style={styles.infoBox}>
              📅 <strong>Visit Date:</strong> {latestRecord.date}
            </div>
            <div style={styles.infoBox}>
              🗺️ <strong>Region:</strong> {latestRecord.region}
            </div>
          </div>

          {/* PREGNANCY + SYMPTOMS */}
          <div style={styles.infoRow}>
            <div style={styles.infoBox}>
              🤰 <strong>{t.pregnancyMonth}:</strong> {latestRecord.pregnancyMonth}
            </div>
            <div style={styles.infoBox}>
              🤒 <strong>{t.symptoms}:</strong> {latestRecord.symptoms}
            </div>
          </div>

          {/* VITALS GRID */}
          <h4 style={styles.sectionTitle}>Vitals</h4>

          <div style={styles.vitalsGrid}>
            <Vital label="BP (Sys)" value={latestRecord.vitals?.SystolicBP} />
            <Vital label="BP (Dia)" value={latestRecord.vitals?.DiastolicBP} />
            <Vital label="Sugar" value={latestRecord.vitals?.BS} />
            <Vital label="Temp" value={latestRecord.vitals?.BodyTemp} />
            <Vital label="HR" value={latestRecord.vitals?.HeartRate} />
          </div>
        </>
      ) : (
        <p style={styles.empty}>No medical records available.</p>
      )}

      {/* AI RISK */}
      {aiData.riskLevel && (
        <div style={styles.aiBox}>
          <h4 style={styles.sectionTitle}>
            🧠 {t.riskAssessment}
          </h4>

          <div style={styles.riskBadge(aiData.riskLevel)}>
            {aiData.riskLevel.toUpperCase()}
          </div>

          <ul style={styles.reasonList}>
            {aiData.reasons?.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          <p style={styles.sampleText}>
            Matched samples: {aiData.matchedSamples}
          </p>

          {aiData.explanation && (
            <VoiceOutput text={aiData.explanation} />
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- SMALL COMPONENT ---------------- */

function Vital({ label, value }) {
  return (
    <div style={styles.vitalCard}>
      <div style={styles.vitalLabel}>{label}</div>
      <div style={styles.vitalValue}>{value ?? "--"}</div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  container: {
    background: "#fff",
    borderRadius: 18,
    padding: 18,
    border: "1px solid #f3c0d8",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  name: {
    margin: 0,
    fontSize: 20,
    color: "#7c2d12",
  },

  ageChip: {
    display: "inline-block",
    marginTop: 4,
    background: "#fce7f3",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 13,
  },

  editBtn: {
    background: "#fff",
    border: "1px solid #f3c0d8",
    padding: "6px 10px",
    borderRadius: 8,
    cursor: "pointer",
  },

  editBox: {
    background: "#fff5f7",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },

  input: {
    width: "100%",
    padding: 8,
    borderRadius: 8,
    border: "1px solid #f3c0d8",
    marginBottom: 6,
  },

  primaryBtn: {
    background: "#ec407a",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 8,
    marginRight: 6,
  },

  secondaryBtn: {
    background: "#fce4ec",
    border: "1px solid #f3c0d8",
    padding: "6px 12px",
    borderRadius: 8,
  },

  infoRow: {
    display: "flex",
    gap: 10,
    marginBottom: 12,
  },

  infoBox: {
    flex: 1,
    background: "#fdf3f7",
    padding: 10,
    borderRadius: 12,
    fontSize: 14,
  },

  sectionTitle: {
    margin: "12px 0 8px",
    color: "#ab47bc",
  },

  vitalsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 10,
  },

  vitalCard: {
    background: "linear-gradient(135deg, #f9d1e4, #f3b6cf)",
    padding: 12,
    borderRadius: 14,
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(236,64,122,0.25)",
  },

  vitalLabel: {
    fontSize: 12,
    color: "#7a1f46",
  },

  vitalValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#7c2d12",
  },

  aiBox: {
    marginTop: 16,
    background: "#fff7ed",
    padding: 14,
    borderRadius: 14,
    borderLeft: "5px solid #fb923c",
  },

  riskBadge: (level) => ({
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 999,
    background:
      level === "high"
        ? "#fee2e2"
        : level === "medium" || level === "mid"
        ? "#fef3c7"
        : "#dcfce7",
    color:
      level === "high"
        ? "#dc2626"
        : level === "medium" || level === "mid"
        ? "#d97706"
        : "#15803d",
    fontWeight: 600,
    marginBottom: 8,
  }),

  reasonList: {
    paddingLeft: 18,
    fontSize: 14,
  },

  sampleText: {
    fontSize: 12,
    color: "#666",
  },

  empty: {
    textAlign: "center",
    color: "#888",
  },
};








