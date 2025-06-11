import express from "express";
import PatientRecordController from './../controllers/PatientRecordController.js';
// import patientValidator from '../validation/patientAuthValid.js';

const router = express.Router();

router.get('/',PatientRecordController.getPatientRecords);
router.patch('/',PatientRecordController.updatePatientRecords);

export default router;
