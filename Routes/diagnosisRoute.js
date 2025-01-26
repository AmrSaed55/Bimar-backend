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

router.route('/consultation/:id')
.patch(diagnosisController.updateconsultation)
.delete(diagnosisController.deleteconsultation)


export default router;
