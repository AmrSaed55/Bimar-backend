const PatientModel = require("../models/PatientAuth_Model");
const responseMsgs = require('./../utilities/responseMsgs');
const errorHandler = require('./../utilities/errorHandler');
const { validationResult } = require("express-validator");

const createMedicalRecord = async (req, res) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw errors
    }
    
    const { patientId } = req.params;
    const medicalRecordData = req.body;

    const patient = await PatientModel.findById(patientId);
    if (!patient) {
      throw "Patient not found"
    }

    patient.medicalRecord = medicalRecordData;
    await patient.save();

    res.status(201).json({
      status: responseMsgs.SUCCESS,
      data: patient.medicalRecord,
    });
  } catch (err) {
    errorHandler(res, err);
  }
};

const getMedicalRecords = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await PatientModel.findById(patientId).select("medicalRecord");
    if (!patient) {
       throw "Patient not found"
    }

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: patient.medicalRecord,
    });
  } catch (err) {
    console.log(err)
    errorHandler(res, err);
  }
};

module.exports = {
  createMedicalRecord,
  getMedicalRecords,
};
