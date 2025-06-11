import express from "express";
import AdminAuthController from "../controllers/AdminController.js";

const router = express.Router();

router.post("/register",AdminAuthController.register);
router.get('/patients',AdminAuthController.getAllPatients);
router.get('/appointments',AdminAuthController.getAllAppointments);
router.get('/doctors',AdminAuthController.getAllDoctors);
router.put('/doctor/activate/:id',AdminAuthController.DoctorActivate);
router.put('/doctor/reject/:id',AdminAuthController.DoctorRejection);
router.put('/doctor/ban/:id',AdminAuthController.DoctorBan);
router.put('/doctor/suspend/:id',AdminAuthController.DoctorSuspend);

export default router;