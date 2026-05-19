import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/me',  auth, getProfile);
router.put('/me',  auth, updateProfile);

export default router;
