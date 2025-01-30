import PatientModel from "../models/PatientAuth_Model.js";
import responseMsgs from './../utilities/responseMsgs.js';
import errorHandler from './../utilities/errorHandler.js';
import { validationResult } from "express-validator";
import jwt from 'jsonwebtoken';

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
    const userEmail = decoded.email;

    const medicalRecordData = req.body;

    // Find patient by email
    const patient = await PatientModel.findOne({ userEmail });
    if (!patient) {
      throw "Patient not found";
    }

    console.log('Medical Record Data:', medicalRecordData);
    // Update medical record
    patient.medicalRecord = medicalRecordData;
    console.log('Saving Medical Record:', patient.medicalRecord);
    await patient.save();
    console.log(patient.medicalRecord)

     

    res.status(201).json({
      status: 'success',
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
    const patient = await PatientModel.findOne({ userEmail }).select("medicalRecord");
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
    const patient = await PatientModel.findOne({ userEmail }).select("medicalRecord");
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
    const patient = await PatientModel.findOne({ userEmail }).select("medicalRecord");
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
  deleteMedicalRecord
};
