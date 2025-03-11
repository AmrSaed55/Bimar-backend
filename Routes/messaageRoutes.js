import express from "express";
import messageController from "../controllers/messageController.js";
import protectRoute from "../middleware/protectRoute.js"

const router = express.Router();

router.post("/send/:id", protectRoute, messageController.sendMessage);
router.get("/history/:doctorId/:patientId", messageController.getChatHistory);

export default router;
