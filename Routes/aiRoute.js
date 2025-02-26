import express from 'express';
import { predictDoctorSpecialty } from '../controllers/aiController.js';

const router = express.Router();

router.post('/predict', predictDoctorSpecialty);

export default router;