import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import VoiceInput from "../components/voice/VoiceInput";

export default function AddPatient({ onSave }) {
  const { t, user } = useAppContext();

  

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [month, setMonth] = useState("");
  const [symptoms, setSymptoms] = useState("");

  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [region, setRegion] = useState("");

  const [systolicBP, setSystolicBP] = useState("");
  const [diastolicBP, setDiastolicBP] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");
  const [bodyTemp, setBodyTemp] = useState("");
  const [heartRate, setHeartRate] = useState("");

  const [reportFile, setReportFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleReportScan = async (file) => {
    if (!file) return;

    setIsScanning(true);
    setScanError("");
    setNeedsVerification(false);

    try {
      const formData = new FormData();
      formData.append("report", file);

      const res = await fetch("http://localhost:5000/api/scan-report", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Scan failed");

      const data = await res.json();
      console.log("📄 Scanned data received:", data);

      if (data.patientName) setName(data.patientName);
      if (data.age) setAge(String(data.age));
      if (data.pregnancyMonth) setMonth(String(data.pregnancyMonth));
      if (data.region) setRegion(data.region);

      if (data.symptoms) {
        if (typeof data.symptoms === "string") {
          setSymptoms(data.symptoms);
        } else if (Array.isArray(data.symptoms)) {
          setSymptoms(data.symptoms.join(", "));
        }
      }

      if (data.vitals) {
        if (data.vitals.SystolicBP) setSystolicBP(String(data.vitals.SystolicBP));
        if (data.vitals.DiastolicBP) setDiastolicBP(String(data.vitals.DiastolicBP));
        if (data.vitals.BS?.value) setBloodSugar(String(data.vitals.BS.value));
        if (data.vitals.BodyTemp?.value) setBodyTemp(String(data.vitals.BodyTemp.value));
        if (data.vitals.HeartRate) setHeartRate(String(data.vitals.HeartRate));
      }

      if (data.confidence === "low") {
        setScanError("⚠️ Handwriting unclear. Please verify all extracted values carefully.");
      }

      setNeedsVerification(true);
    } catch (err) {
      console.error("❌ Report scan error:", err);
      setScanError("Report could not be read clearly. Please verify manually.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !age || !month) {
      alert("Please complete and verify patient details before saving.");
      return;
    }

    const record = {
      recordId: Date.now().toString(),
      date: visitDate,
      region,
      pregnancyMonth: month.trim(),
      symptoms: symptoms.trim(),
      vitals: {
        SystolicBP: systolicBP.trim(),
        DiastolicBP: diastolicBP.trim(),
        BS: bloodSugar.trim(),
        BodyTemp: bodyTemp.trim(),
        HeartRate: heartRate.trim(),
      },
    };

    // Send to Make.com webhook
    try {
      await fetch("https://hook.eu1.make.com/s2cw496gpe650a6vaa6uloowy41il6on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          age: age.trim(),
          record,
        }),
      });
    } catch (err) {
      console.error("❌ Make.com webhook error:", err);
    }

    // Local save
onSave({
  userId: user.id,
  name: name.trim(),
  age: age.trim(),
  records: [record],
});


    // Reset form
    setName("");
    setAge("");
    setMonth("");
    setSymptoms("");
    setVisitDate(new Date().toISOString().split("T")[0]);
    setRegion("");
    setSystolicBP("");
    setDiastolicBP("");
    setBloodSugar("");
    setBodyTemp("");
    setHeartRate("");
    setReportFile(null);
    setNeedsVerification(false);
    setScanError("");

    alert(t.patientSaved);
  };

  /* ---------- STYLES ---------- */

  const inputStyle = {
    width: "94%",
    marginBottom: "10px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #f3b6cf",
    background: "#fff5f9",
    fontSize: "14px",
    outline: "none",
  };

  const uploadContainer = {
    width: "94%",
    marginTop: "14px",
    marginBottom: "26px",
  };

  const uploadButton = {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "2px dashed #ec4899",
    background: "#fff0f6",
    color: "#9d174d",
    fontWeight: "500",
    cursor: "pointer",
    textAlign: "left",
  };

  const submitBtn = {
    width: "94%",
    padding: "12px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #ec4899, #db2777)",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      {/* Basic Info */}
      <input style={inputStyle} type="text" placeholder={t.patientName} value={name} onChange={(e) => setName(e.target.value)} />
      <input style={inputStyle} type="number" placeholder={t.patientAge} value={age} onChange={(e) => setAge(e.target.value)} />
      <input style={inputStyle} type="number" placeholder={t.pregnancyMonth} value={month} onChange={(e) => setMonth(e.target.value)} />

      {/* Visit Metadata */}
      <input
        style={inputStyle}
        type="date"
        value={visitDate}
        onChange={(e) => setVisitDate(e.target.value)}
      />

      <select
        style={inputStyle}
        value={region}
        onChange={(e) => setRegion(e.target.value)}
      >
        <option value="">Select Region</option>
        <option value="North India">North India</option>
        <option value="South India">South India</option>
        <option value="East India">East India</option>
        <option value="West India">West India</option>
        <option value="Central India">Central India</option>
      </select>

      {/* Vitals */}
      <input style={inputStyle} type="number" placeholder={t.systolicBP} value={systolicBP} onChange={(e) => setSystolicBP(e.target.value)} />
      <input style={inputStyle} type="number" placeholder={t.diastolicBP} value={diastolicBP} onChange={(e) => setDiastolicBP(e.target.value)} />
      <input style={inputStyle} type="number" placeholder={t.bloodSugar} value={bloodSugar} onChange={(e) => setBloodSugar(e.target.value)} />
      <input style={inputStyle} type="number" placeholder={t.bodyTemp} value={bodyTemp} onChange={(e) => setBodyTemp(e.target.value)} />
      <input style={inputStyle} type="number" placeholder={t.heartRate} value={heartRate} onChange={(e) => setHeartRate(e.target.value)} />

      {/* Symptoms */}
      <input
        style={inputStyle}
        type="text"
        placeholder={t.symptoms}
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
      />

      {/* Voice Input (hidden) */}
      <div style={{ display: "none" }}>
        <VoiceInput onResult={(text) => setSymptoms(text)} />
      </div>

      {/* Report Upload */}
      <div style={uploadContainer}>
        <label style={uploadButton}>
          📎 {t.chooseFile}
          <input
            type="file"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files[0];
              setReportFile(file);
              handleReportScan(file);
            }}
          />
        </label>

        {reportFile && (
          <div style={{ marginTop: "6px", fontSize: "13px", color: "#555" }}>
            📄 {reportFile.name}
          </div>
        )}

        {isScanning && (
          <div style={{ marginTop: "8px", color: "#555" }}>
            🔍 Scanning report… please wait
          </div>
        )}

        {needsVerification && (
          <div style={{ marginTop: "8px", color: "#d97706", fontWeight: "500" }}>
            ⚠️ Please verify the extracted details before saving
          </div>
        )}

        {scanError && (
          <div style={{ marginTop: "8px", color: "red" }}>
            ❌ {scanError}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button onClick={handleSubmit} style={submitBtn}>
        {t.addPatient}
      </button>
    </div>
  );
}




