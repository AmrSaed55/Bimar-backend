const express = require('express');
const router = express.Router();
const doctorController = require("../controllers/doctorController");

router.post("/doctorRegister", doctorController.register);
router.post("/doctorLogin", doctorController.login);
router.post("/forget-password", doctorController.forgetPassword);
router.post("/verify-otp", doctorController.verifyOtp);
router.post("/reset-password", doctorController.resetPassword);

module.exports = router