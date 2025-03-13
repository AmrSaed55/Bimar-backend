import express from "express";
import {
  createMedicalRecord,
  getMedicalRecords,
  updateMedicalRecord,
  deleteMedicalRecord,
} from "../controllers/MedicalRecord.js";
import medicalRecordValidation from "../validation/patientAuthValid.js";

const router = express.Router();

router.post(
  "/create",
  medicalRecordValidation.medicalRecordValidation(),
  createMedicalRecord
);
router.put("/update", updateMedicalRecord);
router.delete("/delete", deleteMedicalRecord);
router.get("/", getMedicalRecords);

export default router;
