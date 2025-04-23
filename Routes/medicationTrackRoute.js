import medicationTrack from "../controllers/medicationTrack.js";
import express from "express";

const router = express.Router();

router.get("/track",medicationTrack)

export default router