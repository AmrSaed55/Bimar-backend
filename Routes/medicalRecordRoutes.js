const express = require('express');
const router = express.Router();
const { createMedicalRecord, getMedicalRecords, getMedicalRecordById } = require('../controllers/MedicalRecord');
const medicalRecordValidation = require('../validation/patientAuthValid');

router.post('/:patientId', medicalRecordValidation(), createMedicalRecord);
router.get("/:patientId", getMedicalRecords);

module.exports = router;
