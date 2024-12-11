const express = require('express');
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const doctorValidation = require("../validation/doctorValid");

router.post("/doctorRegister",doctorValidation(), doctorController.register);
router.post("/doctorLogin", doctorController.login);
router.post("/forget-password", doctorController.forgetPassword);
router.post("/verify-otp", doctorController.verifyOtp);
router.post("/reset-password", doctorController.resetPassword);

module.exports = router