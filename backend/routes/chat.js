import { Router } from 'express';
import {
  getThreads, getMessages, sendMessage,
  getPeople, getGeneralMessages, sendGeneralMessage,
} from '../controllers/chatController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/threads',            auth, getThreads);
router.get('/messages/:userId',   auth, getMessages);
router.post('/messages/:userId',  auth, sendMessage);
router.get('/people',             auth, getPeople);
router.get('/general',            auth, getGeneralMessages);
router.post('/general',           auth, sendGeneralMessage);

export default router;
