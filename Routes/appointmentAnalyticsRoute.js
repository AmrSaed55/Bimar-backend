import express from "express";
import appointmentAnalytics from "../controllers/appointmentAnalytics.js"

const router = express.Router();

router.get("/daily/:doctorId",appointmentAnalytics.getDailyAnalytics);
router.get("/weekly/:doctorId",appointmentAnalytics.getWeeklyAnalytics);
router.get("/monthly/:doctorId",appointmentAnalytics.getMonthlyAnalytics);
router.get("/yearly/:doctorId",appointmentAnalytics.getYearlyAnalytics);
router.get("/total/:doctorId",appointmentAnalytics.getTotalAnalytics);

export default router;
