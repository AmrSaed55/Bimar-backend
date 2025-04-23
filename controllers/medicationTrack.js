import jwt from "jsonwebtoken";
import PatientModel from "../models/PatientAuth_Model.js";
import moment from "moment";
import errorHandler from "../utilities/errorHandler.js";

const medicationTrack = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) throw "No Token Found";

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const id = decoded.userId;

    const patient = await PatientModel.findById(id);
    if (!patient) throw "Patient Not Found";

    const today = moment().startOf("day");
    const medicationsToday = [];

    patient.Diagnosis.forEach((diag) => {
      const prescription = diag.prescription;
      if (!prescription || !prescription.prescriptionInstruction?.length) return;

      const rawDate = prescription.prescriptionDate;
      if (!rawDate) return; // Defensive check

      const startDate = moment(rawDate).startOf("day");

      prescription.prescriptionInstruction.forEach((med) => {
        const medEndDate = moment(startDate).add(med.duration, 'weeks').endOf("day");

        console.log("Medication:", med.medication);
        console.log("Start Date:", startDate.format('YYYY-MM-DD'));
        console.log("End Date:", medEndDate.format('YYYY-MM-DD'));
        console.log("Today:", today.format('YYYY-MM-DD'));

        const isActive =
          today.isSameOrAfter(startDate) && today.isSameOrBefore(medEndDate);
        console.log("isActive:", isActive);

        if (isActive) {
          medicationsToday.push({
            medication: med.medication,
            dosage: med.dosage,
            frequency: med.frequency,
            times: generateTimes(med.frequency),
          });
        }
      });
    });

    console.log("medicationsToday:-", medicationsToday);

    return res.status(200).json({
      success: true,
      data: medicationsToday,
    });
  } catch (error) {
    console.error("Error in medicationTrack:", error);
    errorHandler(res, error);
  }
};

// Simple function to generate sample times based on frequency
const generateTimes = (frequency) => {
  const times = [];
  const hoursGap = Math.floor(24 / frequency);
  for (let i = 0; i < frequency; i++) {
    times.push(`${String(i * hoursGap).padStart(2, '0')}:00`);
  }
  return times;
};

export default medicationTrack;
