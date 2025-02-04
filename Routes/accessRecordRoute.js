import express from 'express'
import * as accessRecordController from '../controllers/accessRecord.js';
const router = express.Router()

router.post("/generate-qr",accessRecordController.QRcodeGeneration)
router.post("/verify-qr",accessRecordController.QRcodeVerification)
router.post("/generate-link",accessRecordController.generateAccessLink)
router.post("/verify-link",accessRecordController.verifyAccessLink)

export default router
