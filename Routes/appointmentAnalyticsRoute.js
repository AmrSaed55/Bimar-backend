import express from "express";
import appointmentAnalytics from "../controllers/appointmentAnalytics.js"

const router = express.Router();

router.get("/daily",appointmentAnalytics.getDailyAnalytics);
router.get("/weekly",appointmentAnalytics.getWeeklyAnalytics);
router.get("/monthly",appointmentAnalytics.getMonthlyAnalytics);
router.get("/yearly",appointmentAnalytics.getYearlyAnalytics);
router.get("/total",appointmentAnalytics.getTotalAnalytics);

export default router;
