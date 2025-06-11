import express from 'express';
import PatientRecordController from '../controllers/PatientRecordController.js';

const router = express.Router();

router.get('/', PatientRecordController.getPatientRecords);
router.patch('/personal', PatientRecordController.updatePersonalRecords); // Old route
router.patch('/', PatientRecordController.updatePatientRecords); // New combined route

export default router; 