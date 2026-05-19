import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requestOtp, verifyOtp, logout } from '../controllers/authController.js';

const router = Router();

const otpLimiter = rateLimit({
  windowMs:       15 * 60 * 1000, // 15 minutes
  max:            10,              // max 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders:  false,
  message: { success: false, message: 'Хэт олон оролдлого. 15 минутын дараа дахин оролдоно уу.', data: null },
});

router.post('/request-otp', otpLimiter, requestOtp);
router.post('/verify-otp',  otpLimiter, verifyOtp);
router.post('/logout',      logout);

export default router;
