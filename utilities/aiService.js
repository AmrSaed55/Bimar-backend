import axios from 'axios';

const PYTHON_API_URL = 'http://127.0.0.1:5001/predict';

export const getDoctorSpecialtyPrediction = async (symptoms) => {
  try {
    const response = await axios.post(PYTHON_API_URL, { symptoms });

    // Check if we have both disease and specialist in the response
    if (!response.data.disease || !response.data.specialist) {
      throw new Error("Invalid response from Python API.");
    }

    return {
      prediction: response.data.disease, // Changed from prediction to disease
      specialist: response.data.specialist
    };

  } catch (error) {
    console.error("Error communicating with Python API:", 
      error.response ? error.response.data : error.message);
    throw new Error("Failed to get prediction from AI model.");
  }
};