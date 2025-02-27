import express from 'express';
import {
    getHeadSymptoms, getChestSymptoms, getStomachSymptoms,
    getLimbSymptoms, getSkinSymptoms, getGeneralSymptoms, getAllSymptoms
} from '../controllers/symptomController.js';

const router = express.Router();

router.get('/head', getHeadSymptoms);
router.get('/chest', getChestSymptoms);
router.get('/stomach', getStomachSymptoms);
router.get('/limb', getLimbSymptoms);
router.get('/skin', getSkinSymptoms);
router.get('/general', getGeneralSymptoms);
router.get('/all', getAllSymptoms);

export default router;
