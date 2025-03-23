import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

// Obtener todos los usuarios (ocultando la contraseña)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Registrar usuario
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    const newUser = await User.create({ first_name, last_name, email, age, password });
    res.json({ message: 'Usuario registrado', user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

export default router;
