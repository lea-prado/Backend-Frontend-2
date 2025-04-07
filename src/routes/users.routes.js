import { Router } from 'express';
import { register } from '../controllers/sessionController.js';
import { getUsers } from '../controllers/userController.js';

const router = Router();

router.post('/register', register);
router.get('/', getUsers);

export default router;
