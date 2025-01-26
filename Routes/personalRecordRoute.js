import express from "express";
import PatientRecordController from './../controllers/PatientRecordController.js';
// import patientValidator from '../validation/patientAuthValid.js';

const router = express.Router();

router.get('/',PatientRecordController.getPatientRecords);
router.put('/',PatientRecordController.updatePersonalRecords);

export default router;
