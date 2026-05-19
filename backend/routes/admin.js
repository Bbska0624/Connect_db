import { Router } from 'express';
import { getDashboard, getUsers, blockUser, getReports } from '../controllers/adminController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = Router();

router.get('/dashboard',        auth, adminAuth, getDashboard);
router.get('/users',            auth, adminAuth, getUsers);
router.put('/users/:id/block',  auth, adminAuth, blockUser);
router.get('/reports',          auth, adminAuth, getReports);

export default router;
