import express from "express";
import messageController from "../controllers/messageController.js";
import protectRoute from "../middleware/protectRoute.js"
import upload from "../middleware/multerConfig.js";


const router = express.Router();

router.post("/send/:id", protectRoute, upload.array("files", 5), messageController.sendMessage);
router.get("/:id", protectRoute, messageController.getMessages);

export default router;
