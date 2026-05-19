import { Router } from 'express';
import { getSchedule, saveSchedule } from '../controllers/scheduleController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/me', auth, getSchedule);
router.put('/me', auth, saveSchedule);

export default router;
