// src/routes/sessions.routes.js
import { Router } from 'express';
import passport from 'passport';
import { login, currentUser } from '../controllers/sessionController.js';

const router = Router();

router.post('/login', passport.authenticate('local', { session: false }), login);
router.get('/current', passport.authenticate('jwt', { session: false }), currentUser);
router.post('/login', passport.authenticate('local'), login);

export default router;
