import PatientCardUI from "./PatientCardUI";

export default function PatientListUI({ patients, onPatientClick }) {
  return (
    <div style={styles.list}>
      {patients.length === 0 && (
        <p style={styles.noPatients}>No patients added yet.</p>
      )}

      {patients.map((p) => (
        <PatientCardUI
          key={p.id}
          patient={p}
          onClick={() => onPatientClick(p.id)}
        />
      ))}
    </div>
  );
}
