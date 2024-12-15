const express = require('express');
const router = express.Router();
const PatinetAuthController = require ('./../controllers/PatientAuth');
const patientvalidator = require('./../validation/patientAuthValid');
const upload = require('./../utilities/imagUpload');

router.post('/patientRegister' ,patientvalidator.userValidation(), PatinetAuthController.register);
router.post('/patientLogin',PatinetAuthController.login);
router.post('/forgot-password', PatinetAuthController.forgetpassword);
router.post('/verify-otp',PatinetAuthController.verifyotp);
router.post('/reset-password', PatinetAuthController.resetPassword);
router.patch('/update-profile-picture', 
  upload.uploadPatientProfile.single('profileImage'), 
  PatinetAuthController.updateProfilePicture
);

module.exports = router