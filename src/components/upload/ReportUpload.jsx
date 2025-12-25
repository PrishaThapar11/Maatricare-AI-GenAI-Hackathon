import React from "react";

export default function ReportUpload({ onUpload }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result;
      onUpload(base64Data);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        style={{ cursor: "pointer" }}
      />
    </div>
  );
}
