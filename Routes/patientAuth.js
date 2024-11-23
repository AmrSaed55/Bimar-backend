const express = require('express')
const router = express.Router()
const PatinetAuthController = require ('./../controllers/PatientAuth')
const uservalidator = require('./../validation/patientAuthValid')

router.post('/patientRegister' ,uservalidator(), PatinetAuthController.register)
router.post('/patientLogin',PatinetAuthController.login)

module.exports = router