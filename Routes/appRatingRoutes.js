import express from "express";
import appRatingController from "../controllers/appRatingController.js";

const router = express.Router();

router.post('/',appRatingController.submitAppRating);
router.patch('/',appRatingController.updateAppRating);
router.delete('/',appRatingController.deleteAppRating);
router.get('/',appRatingController.getAppRatings);

export default router;