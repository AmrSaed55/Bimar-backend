import express from "express";
import ratingController from "../controllers/ratingController.js";

const router = express.Router()

    router.post('/', ratingController.submitRating);
    router.get('/:doctorId', ratingController.getDoctorRatings);
    router.patch('/', ratingController.updateRating);
    router.delete('/:ratingId', ratingController.deleteRating);

    export default router;