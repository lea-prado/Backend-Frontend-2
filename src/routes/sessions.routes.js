import { Router } from 'express';
import passport from '../config/passportStrategies.js';
import { login, current } from '../controllers/sessionController.js';

const router = Router();

// Login con estrategia local
router.post('/login', passport.authenticate('local', { session: false }), login);

// Obtener usuario actual (requiere JWT)
router.get('/current', passport.authenticate('jwt', { session: false }), current);

// Ruta de prueba para sesiones
router.get('/test', (req, res) => {
    res.json({ message: 'Ruta de sesiones funcionando' });
  });

  router.get('/', (req, res) => {
    res.json({ message: 'Ruta de sesiones funcionando' });
  });
  
export default router;
