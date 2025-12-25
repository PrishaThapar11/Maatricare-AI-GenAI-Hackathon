export default function AddPatientFormUI({ onSubmit }) {
  // SAME state as teammate
  // SAME JSX
  // SAME styles

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !age || !month || !symptoms) return;
    onSubmit({ name, age, month, symptoms });
    reset();
  };
}
