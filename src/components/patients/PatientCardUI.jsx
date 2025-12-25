export default function PatientCardUI({ patient, onClick }) {
  return (
    <div style={styles.card}>
      <div>
        <p style={styles.name}>{patient.name}</p>
        <p style={styles.info}>Age: {patient.age}</p>
        <p style={styles.info}>Pregnancy Month: {patient.month}</p>
      </div>
      <button style={styles.button} onClick={onClick}>
        View / Update
      </button>
    </div>
  );
}
