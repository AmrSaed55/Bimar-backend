import responseMsgs from "../utilities/responseMsgs.js";
import errorHandler from "../utilities/errorHandler.js";
import jwt from "jsonwebtoken";
import Patient from "../models/PatientAuth_Model.js";

const getPatientRecords = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      throw "No Token Provided";
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const patient = await Patient.findById(decoded.userId).select(
      "personalRecords medicalRecord"
    );
    if (!patient) {
      throw "Patient not found";
    }

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: {
        personalRecords: patient.personalRecords,
        medicalRecord: patient.medicalRecord
      },
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

const updatePatientRecords = async (req, res) => {
  try {
    const updateData = req.body;

    const token = req.cookies.jwt;
    if (!token) {
      throw "No Token Provided";
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Build the update object for MongoDB $set operation
    const updateQuery = {};

    // Handle personalRecords updates
    if (updateData.personalRecords) {
      Object.keys(updateData.personalRecords).forEach(key => {
        if (updateData.personalRecords[key] !== undefined && updateData.personalRecords[key] !== null) {
          updateQuery[`personalRecords.${key}`] = updateData.personalRecords[key];
        }
      });
    }

    // Handle medicalRecord updates
    if (updateData.medicalRecord) {
      Object.keys(updateData.medicalRecord).forEach(key => {
        if (updateData.medicalRecord[key] !== undefined && updateData.medicalRecord[key] !== null) {
          // Handle nested familyHistory specially
          if (key === 'familyHistory' && typeof updateData.medicalRecord[key] === 'object') {
            Object.keys(updateData.medicalRecord[key]).forEach(subKey => {
              if (updateData.medicalRecord[key][subKey] !== undefined && updateData.medicalRecord[key][subKey] !== null) {
                updateQuery[`medicalRecord.familyHistory.${subKey}`] = updateData.medicalRecord[key][subKey];
              }
            });
          } else {
            updateQuery[`medicalRecord.${key}`] = updateData.medicalRecord[key];
          }
        }
      });
    }

    // Update the patient using $set to avoid validation issues
    const updatedPatient = await Patient.findByIdAndUpdate(
      decoded.userId,
      { $set: updateQuery },
      { new: true, runValidators: true }
    ).select("personalRecords medicalRecord");

    if (!updatedPatient) {
      throw "Patient not found";
    }

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      message: "Patient records updated successfully",
      data: {
        personalRecords: updatedPatient.personalRecords,
        medicalRecord: updatedPatient.medicalRecord
      },
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

export default {
  getPatientRecords,
  updatePatientRecords,
};
