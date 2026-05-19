import { Router } from 'express';
import { requestOtp, verifyOtp, logout } from '../controllers/authController.js';

const router = Router();

router.post('/request-otp', requestOtp);
router.post('/verify-otp',  verifyOtp);
router.post('/logout',      logout);

export default router;
