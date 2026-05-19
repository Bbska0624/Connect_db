import { Router } from 'express';
import { getDashboard, getUsers, blockUser, getReports } from '../controllers/adminController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/dashboard',        auth, getDashboard);
router.get('/users',            auth, getUsers);
router.put('/users/:id/block',  auth, blockUser);
router.get('/reports',          auth, getReports);

export default router;
