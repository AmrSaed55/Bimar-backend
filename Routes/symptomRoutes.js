import express from 'express';
import {
    getHeadSymptoms,
    getEyeSymptoms,
    getChestSymptoms,
    getUrinaryReproductiveSymptoms,
    getMusculoskeletalSymptoms,
    getGeneralSymptoms,
    getPregnancySymptoms,
    getThroatAndMouthSymptoms,
    getSkinSymptoms,
    getMentalSymptoms,
    getAllSymptoms,
    getDigestiveSymptoms, 
    getStomachSymptoms,   
    getLimbSymptoms       
} from '../controllers/symptomController.js';

const router = express.Router();

// Existing routes
router.get('/head', getHeadSymptoms);
router.get('/eyes', getEyeSymptoms);
router.get('/chest', getChestSymptoms);
router.get('/urinary-reproductive', getUrinaryReproductiveSymptoms);
router.get('/musculoskeletal', getMusculoskeletalSymptoms);
router.get('/general', getGeneralSymptoms);
router.get('/pregnancy', getPregnancySymptoms);
router.get('/digestive', getDigestiveSymptoms);
router.get('/throat-mouth', getThroatAndMouthSymptoms);
router.get('/skin', getSkinSymptoms);
router.get('/mental', getMentalSymptoms);
router.get('/all', getAllSymptoms);
router.get('/stomach', getStomachSymptoms);
router.get('/limbs', getLimbSymptoms);

export default router;