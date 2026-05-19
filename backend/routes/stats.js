import { Router } from 'express';
import { getStats } from '../controllers/statsController.js';

const router = Router();

router.get('/', getStats); // public

export default router;
