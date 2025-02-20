import { getDoctorSpecialtyPrediction } from '../utilities/aiService.js'; // Correct path

export const predictDoctorSpecialty = async (req, res) => {
  try {
    const symptoms = req.body.symptoms;

    // Validate input
    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: "Symptoms must be provided as an array." });
    }

    // Get prediction and specialist from the AI service
    const response = await getDoctorSpecialtyPrediction(symptoms);

    // Check if the response contains the required data
    if (!response.prediction || !response.specialist) {
      return res.status(500).json({ error: "Invalid response from AI service." });
    }

    // Send the prediction and specialist to the frontend
    res.json({
      prediction: response.prediction,
      specialist: response.specialist
    });

  } catch (error) {
    console.error("Error predicting doctor specialty:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};