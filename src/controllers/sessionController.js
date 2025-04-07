import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Cart from '../models/Cart.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_jwt_secret';

export const login = (req, res) => {
  const user = req.user;
  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.cookie('jwt', token, { httpOnly: true, secure: false });
  return res.redirect('/');
};

export const register = async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, role } = req.body;
    const newUser = new User({ first_name, last_name, email, age, password, role });
    await newUser.save();

    const newCart = new Cart({ user: newUser._id, products: [] });
    await newCart.save();
    newUser.cart = newCart._id;
    await newUser.save();

    return res.redirect('/login');
  } catch (error) {
    return res.status(500).json({ message: 'Error en registro', error });
  }
};

export const currentUser = (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'No autenticado' });
  res.json({ user: req.user });
};
