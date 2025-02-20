import axios from 'axios';

const PYTHON_API_URL = 'http://127.0.0.1:5001/predict'; // Correct port

export const getDoctorSpecialtyPrediction = async (symptoms) => {
  try {
    const response = await axios.post(PYTHON_API_URL, { symptoms });
    return response.data.prediction;
  } catch (error) {
    console.error("Error communicating with Python API:", error.response ? error.response.data : error.message);
    throw new Error("Failed to get prediction from AI model.");
  }
};