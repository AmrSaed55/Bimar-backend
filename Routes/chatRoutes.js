import express from 'express';
import chatController from '../controllers/chatController.js';


const router = express.Router();

router.get('/history/:doctorId/:patientId', chatController.getChatHistory);

export default router;