import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  name: String,
  age: Number,
  

  records: [
    {
      date: String,
      region: String,
      pregnancyMonth: String,
      symptoms: String,
      vitals: Object,
    },
  ],
});

export default mongoose.model("Patient", PatientSchema);