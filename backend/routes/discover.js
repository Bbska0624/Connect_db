import { Router } from 'express';
import { getStudents, connectStudent, passStudent } from '../controllers/discoverController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/students',     auth, getStudents);
router.post('/connect/:id', auth, connectStudent);
router.post('/pass/:id',    auth, passStudent);

export default router;
