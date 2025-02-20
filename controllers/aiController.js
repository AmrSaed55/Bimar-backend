import { getDoctorSpecialtyPrediction } from '../utilities/aiService.js'; // Correct path

export const predictDoctorSpecialty = async (req, res) => {
  try {
    const symptoms = req.body.symptoms;
    const prediction = await getDoctorSpecialtyPrediction(symptoms);
    res.json({ prediction });
  } catch (error) {
    console.error("Error predicting doctor specialty:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};