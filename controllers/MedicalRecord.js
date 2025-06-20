import PatientModel from "../models/PatientAuth_Model.js";
import responseMsgs from "./../utilities/responseMsgs.js";
import errorHandler from "./../utilities/errorHandler.js";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import Patient from "../models/PatientAuth_Model.js";

const createMedicalRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw errors;
    }

    const token = req.cookies.jwt;
    if (!token) {
      throw "No Token Provided";
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const patient = await Patient.findById(decoded.userId);
    if (!patient) {
      throw "Patient not found";
    }

    const medicalRecordData = req.body;

    console.log("Medical Record Data:", medicalRecordData);
    // Update medical record
    patient.medicalRecord = medicalRecordData;
    console.log("Saving Medical Record:", patient.medicalRecord);
    await patient.save();
    console.log(patient.medicalRecord);

    res.status(201).json({
      status: "success",
      data: patient.medicalRecord,
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

const getMedicalRecords = async (req, res) => {
  try {
    // Retrieve email from JWT
    const token = req.cookies.jwt;
    if (!token) {
      throw "No Token Provided";
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userEmail = decoded.email;

    // Find patient by email
    const patient = await PatientModel.findOne({ userEmail }).select(
      "medicalRecord"
    );
    if (!patient) {
      throw "Patient not found";
    }

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: patient.medicalRecord,
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

// Update medical record
const updateMedicalRecord = async (req, res) => {
  try {
    const medicalRecordData = req.body;

    // Retrieve email from JWT
    const token = req.cookies.jwt;
    if (!token) {
      throw "No Token Provided";
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userEmail = decoded.email;

    // Find patient by email
    const patient = await PatientModel.findOne({ userEmail }).select(
      "medicalRecord"
    );
    if (!patient) {
      throw "Patient not found";
    }

    // Update the medical record
    patient.medicalRecord = { ...patient.medicalRecord, ...medicalRecordData };
    await patient.save();

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: patient.medicalRecord,
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

// Update medical record by patient ID
const updateMedicalRecordByPatientId = async (req, res) => {
  try {
    const medicalRecordData = req.body;
    const { patientId } = req.params;

    // Retrieve token for verification
    const token = req.cookies.jwt;
    if (!token) {
      throw "No Token Provided";
    }

    // Verify token (though we're using patientId from params)
    jwt.verify(token, process.env.JWT_KEY);

    // Find patient by ID
    const patient = await PatientModel.findById(patientId).select(
      "medicalRecord"
    );
    if (!patient) {
      throw "Patient not found";
    }

    // Update the medical record
    if (!patient.medicalRecord) patient.medicalRecord = {};

    // If the update includes familyHistory, merge it deeply
    if (medicalRecordData.familyHistory) {
      if (!patient.medicalRecord.familyHistory)
        patient.medicalRecord.familyHistory = {};
      Object.assign(
        patient.medicalRecord.familyHistory,
        medicalRecordData.familyHistory
      );
      // Remove familyHistory from the main update to avoid shallow overwrite
      delete medicalRecordData.familyHistory;
    }

    // Merge the rest of the medicalRecord fields
    Object.assign(patient.medicalRecord, medicalRecordData);

    await patient.save();

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: patient.medicalRecord,
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

// Delete medical record
const deleteMedicalRecord = async (req, res) => {
  try {
    // Retrieve email from JWT
    const token = req.cookies.jwt;
    if (!token) {
      throw "No Token Provided";
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userEmail = decoded.email;

    // Find patient by email
    const patient = await PatientModel.findOne({ userEmail }).select(
      "medicalRecord"
    );
    if (!patient) {
      throw "Patient not found";
    }

    // Delete the medical record
    patient.medicalRecord = null;
    await patient.save();

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: "Medical record deleted successfully",
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

export {
  createMedicalRecord,
  getMedicalRecords,
  updateMedicalRecord,
  deleteMedicalRecord,
  updateMedicalRecordByPatientId,
};
