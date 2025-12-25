import express from "express";
import Patient from "../models/Patient.js";

const router = express.Router();

// Get all patients for a user
router.get("/:userId", async (req, res) => {
  try {
    const patients = await Patient.find({ userId: req.params.userId });
    res.json(patients);
  } catch (err) {
    console.error("❌ Error fetching patients:", err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// Add new patient
router.post("/", async (req, res) => {
  try {
    const { userId, name, age, records } = req.body;

    const patient = new Patient({
      userId,
      name,
      age,
      records,
    });

    await patient.save();
    res.json(patient);
  } catch (err) {
    console.error("❌ Error saving patient:", err);
    res.status(500).json({ error: "Failed to save patient" });
  }
});

// Update patient
router.put("/:id", async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating patient:", err);
    res.status(500).json({ error: "Failed to update patient" });
  }
});

export default router;