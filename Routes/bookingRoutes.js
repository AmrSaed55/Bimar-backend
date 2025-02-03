import express from 'express';
import bookingController from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', bookingController.createAppointemnt);
router.get('/', bookingController.getAppointments);
router.patch('/', bookingController.updateAppointment);
router.delete('/:id',bookingController.cancelAppointment);

export default router;
