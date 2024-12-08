const PatientModel = require("../models/PatientAuth_Model");
const responseMsgs = require('./../utilities/responseMsgs');
const errorHandler = require('./../utilities/errorHandler');
const { validationResult } = require("express-validator");

const createMedicalRecord = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: responseMsgs.FAIL,
      errors: errors.array(),
    });
  }

  try {
    const { patientId } = req.params;
    const medicalRecordData = req.body;

    const patient = await PatientModel.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        status: responseMsgs.FAIL,
        message: "Patient not found",
      });
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
      return res.status(404).json({
        status: responseMsgs.FAIL,
        message: "Patient not found",
      });
    }

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: patient.medicalRecord,
    });
  } catch (err) {
    errorHandler(res, err);
  }
};

module.exports = {
  createMedicalRecord,
  getMedicalRecords,
};
