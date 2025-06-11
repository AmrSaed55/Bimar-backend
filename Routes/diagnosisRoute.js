import express from "express";
import diagnosisController from "./../controllers/Diagnosis.js";
import uploadDig from "./../utilities/imagUpload.js";
import DiagnosisValidation from "./../validation/patientAuthValid.js";

const router = express.Router()

router.route('/')
.post(uploadDig.upload.fields([
    { name: 'Xray', maxCount: 5 },
    { name: 'labResults', maxCount: 5 },
  ]),DiagnosisValidation.DiagnosisValidation(),diagnosisController.creatDiagnosis)
.get(diagnosisController.getDiagnosis)
.patch(diagnosisController.updateDiagnosis)

router.route('/:id')
.delete(diagnosisController.deletePrescription)
.patch(diagnosisController.updatePrescription)
.post(diagnosisController.createPrescription)

router.route('/consultation/:id')
.patch(diagnosisController.updateconsultation)
.delete(diagnosisController.deleteconsultation)

router.get('/patient/:patientId/diagnosis/:diagnosisId', diagnosisController.getSpecificDiagnosis);

// New routes for accessing specific prescription, Xray, and lab results
router.get('/:diagnosisId/prescription/:prescriptionId', diagnosisController.getPrescriptionById);
router.get('/:diagnosisId/xray/:xrayId', diagnosisController.getXrayById);
router.get('/:diagnosisId/labresult/:labResultId', diagnosisController.getLabResultById);

// New routes for adding files to existing diagnosis
router.post('/:diagnosisId/xrays', 
  uploadDig.upload.fields([{ name: 'Xray', maxCount: 5 }]),
  diagnosisController.addXraysToDiagnosis
);

router.post('/:diagnosisId/lab-results', 
  uploadDig.upload.fields([{ name: 'labResults', maxCount: 5 }]),
  diagnosisController.addLabResultsToDiagnosis
);

// Routes for removing specific files
router.delete('/:diagnosisId/xray/:xrayIndex', diagnosisController.removeXrayFile);
router.delete('/:diagnosisId/lab-result/:labResultIndex', diagnosisController.removeLabResultFile);

export default router;
