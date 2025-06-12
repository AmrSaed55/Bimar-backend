import express from "express";
import appRatingController from "../controllers/appRatingController.js";

const router = express.Router();

router.post('/',appRatingController.submitAppRating);
router.patch('/',appRatingController.updateAppRating);
router.delete('/',appRatingController.deleteAppRating);
router.get('/admin',appRatingController.getAppRatings);
router.get('/',appRatingController.getRate);


export default router;