import { Router } from 'express';
import { getPlans, getStatus, subscribe } from '../controllers/premiumController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/plans',       getPlans);          // public
router.get('/status',  auth, getStatus);
router.post('/subscribe', auth, subscribe);

export default router;
