import express from "express";
import AdminAuthController from "../controllers/AdminController.js";

const router = express.Router();

router.post("/register",AdminAuthController.register);
router.get('/patients',AdminAuthController.getAllPatients);
router.get('/appointments',AdminAuthController.getAllAppointments);
//router.get('/doctorRequests',);

export default router;