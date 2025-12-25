import { createContext, useContext, useState } from "react";
import { useEffect } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
  const stored = localStorage.getItem("maatricare_user");
  return stored ? JSON.parse(stored) : null;
});
 // ASHA worker
  const [language, setLanguage] = useState("en"); // en | hi
  const [patients, setPatients] = useState([]);
  const [aiFindings, setAIFindings] = useState({}); // patientId -> AI results
useEffect(() => {
  if (!user || !user.userId) return;

  fetch(`http://localhost:5000/api/patients/${user.userId}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      setPatients(data);
    })
    .catch((err) => {
      console.error("❌ Failed to fetch patients:", err.message);
      setPatients([]); // prevent dashboard crash
    });
}, [user]);


const addPatient = async (patient) => {
  // save to backend
  await fetch("http://localhost:5000/api/patients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patient),
  });

  // optimistic UI update
  setPatients((prev) => [
    ...prev,
    {
      id: Date.now().toString(),
      ...patient,
    },
  ]);
};




  const updatePatient = (id, updatedData) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
  };
  const handleLanguageChange = (lang) => {
  setLanguage(lang);
};

  const updateAIFindings = (patientId, findings) => {
    setAIFindings((prev) => ({ ...prev, [patientId]: findings }));
  };

  // Translations
  const translations = {
    en: {
      loginTitle: "ASHA Worker Login",
      loginButton: "Login",
      welcome: "Welcome",
      addPatient: "Add Patient",
      totalPatients: "Total Patients",
      view: "View",
      patientSaved: "Patient saved successfully!",
      patientDetails: "Patient Details",
      patientName: "Name",
      patientAge: "Age",
      pregnancyMonth: "Pregnancy Month",
      symptoms: "Symptoms",
      aiFindings: "AI Findings",
      riskAssessment: "Risk Assessment",
      nutritionPlan: "Nutrition Plan",
      referrals: "Referrals",
        systolicBP: "Systolic BP",
  diastolicBP: "Diastolic BP",
  bloodSugar: "Blood Sugar (BS)",
  bodyTemp: "Body Temp",
  heartRate: "Heart Rate",
  chooseFile: "Choose medical report",

    },
    hi: {
      loginTitle: "आशा कार्यकर्ता लॉगिन",
      loginButton: "लॉगिन",
      welcome: "स्वागत है",
      addPatient: "मरीज जोड़ें",
      totalPatients: "कुल मरीज",
      view: "देखें",
      patientSaved: "मरीज सफलतापूर्वक जोड़ा गया!",
      patientDetails: "मरीज विवरण",
      patientName: "नाम",
      patientAge: "उम्र",
      pregnancyMonth: "गर्भावस्था का महीना",
      symptoms: "लक्षण",
      aiFindings: "एआई निष्कर्ष",
      riskAssessment: "जोखिम मूल्यांकन",
      nutritionPlan: "पोषण योजना",
      referrals: "रेफ़रल",
        systolicBP: "सिस्टोलिक बीपी",
  diastolicBP: "डायस्टोलिक बीपी",
  bloodSugar: "ब्लड शुगर (बीएस)",
  bodyTemp: "शरीर का तापमान",
  heartRate: "हार्ट रेट",
  chooseFile: "मेडिकल रिपोर्ट चुनें",

    },
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        language,
        setLanguage: handleLanguageChange,
        patients,
        aiFindings,
        addPatient,
        updatePatient,
        updateAIFindings,
        t: translations[language],
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

