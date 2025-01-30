import express from 'express';
import doctorController from '../controllers/doctorController.js';
import doctorValidation from '../validation/doctorValid.js';
import uploadProfile from './../utilities/imagUpload.js';

const router = express.Router();

router
  .route("/doctorRegister")
  .post(
    uploadProfile.uploadDocProfile.single("doctorImage"),
    doctorValidation(),
    doctorController.register
  );
router.post("/doctorLogin", doctorController.login);
router.post("/forget-password", doctorController.forgetPassword);
router.post("/verify-otp", doctorController.verifyOtp);
router.post("/reset-password", doctorController.resetPassword);
router.get("/doctors", doctorController.getAllDoctors);

export default router;
