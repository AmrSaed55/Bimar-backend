const express = require('express')
const router = express.Router()
const PatinetAuthController = require ('./../controllers/PatientAuth')
const uservalidator = require('./../validation/patientAuthValid')

router.post('/patientRegister' ,uservalidator.userValidation(), PatinetAuthController.register);
router.post('/patientLogin',PatinetAuthController.login);
router.post('/forgot-password', PatinetAuthController.forgetpassword);
router.post('/verify-otp',PatinetAuthController.verifyotp)
router.post('/reset-password', PatinetAuthController.resetPassword);

module.exports = router