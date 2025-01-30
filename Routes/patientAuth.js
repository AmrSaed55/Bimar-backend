import express from "express";
import PatinetAuthController from "./../controllers/PatientAuth.js";
import patientvalidator from "./../validation/patientAuthValid.js";
import upload from "./../utilities/imagUpload.js";

const router = express.Router();

router.post(
  "/patientRegister",
  patientvalidator.userValidation(),
  PatinetAuthController.register
);
router.post("/patientLogin", PatinetAuthController.login);
router.post("/forgot-password", PatinetAuthController.forgetpassword);
router.post("/verify-otp", PatinetAuthController.verifyotp);
router.post("/reset-password", PatinetAuthController.resetPassword);
router.patch(
  "/update-profile-picture",
  upload.uploadPatientProfile.single("profileImage"),
  PatinetAuthController.updateProfilePicture
);
router.get("/patients/:id", PatinetAuthController.getPatientById);

export default router;
