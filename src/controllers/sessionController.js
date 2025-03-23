import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_jwt_secret';

export const login = (req, res) => {
  // El usuario viene de la estrategia local
  const user = req.user;
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };

  // Generar token
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  // Enviar el token en una cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: false // cambia a true si usas HTTPS
  });

  return res.json({ message: 'Login exitoso', token });
};

export const current = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  res.json({ user: req.user });
};
