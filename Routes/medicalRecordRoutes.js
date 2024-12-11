const express = require('express');
const router = express.Router();
const { createMedicalRecord, getMedicalRecords, updateMedicalRecord, deleteMedicalRecord } = require('../controllers/MedicalRecord');
const medicalRecordValidation = require('../validation/patientAuthValid');

router.post('/create', medicalRecordValidation.medicalRecordValidation(), createMedicalRecord);
router.put('/update', updateMedicalRecord);
router.delete('/delete', deleteMedicalRecord);
router.get('/', getMedicalRecords);



module.exports = router;
