import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { create } from 'express-handlebars';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import config from './config/db.js';
import './config/passportStrategies.js';
import expressHandlebarsLayouts from 'express-handlebars-layouts';

import Product from './models/Product.js';
import User from './models/User.js';
import Cart from './models/Cart.js';

import sessionRoutes from './routes/sessions.routes.js';
import userRoutes from './routes/users.routes.js';
import productRoutes from './routes/products.routes.js';
import cartRoutes from './routes/cart.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tu_jwt_secret';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hbs = create({
  extname: '.handlebars',
  helpers: {
    eq: (a, b) => a === b,
    multiply: (a, b) => a * b
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secretKey',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Middleware para verificar JWT y asignar req.user y res.locals.user
app.use(async (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).populate('cart');
      req.user = user;
      res.locals.user = user;
    } catch (error) {
      res.clearCookie('jwt');
      req.user = null;
      res.locals.user = null;
    }
  } else {
    req.user = null;
    res.locals.user = null;
  }
  next();
});

// Rutas de API
app.use('/api/sessions', sessionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);

// Rutas para Vistas
app.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('home', { title: 'Inicio', products, user: req.user || null });
  } catch (error) {
    res.status(500).send('Error al obtener productos');
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});

app.get('/cart', async (req, res) => {
  if (!req.user) return res.redirect('/login');
  try {
    const cart = await Cart.findById(req.user.cart).populate('products.product');
    if (!cart) return res.status(404).send('Carrito no encontrado');
    const total = cart.products.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    res.render('cart', { title: 'Mi Carrito', cart: { ...cart.toObject(), total }, user: req.user });
  } catch (error) {
    res.status(500).send('Error al obtener el carrito');
  }
});

app.get('/login', (req, res) => res.render('login', { title: 'Iniciar Sesión' }));
app.get('/register', (req, res) => res.render('register', { title: 'Registro' }));
// Sirve archivos estáticos (CSS, imágenes, etc.) desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));
mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  })
  .catch(error => console.error('Error conectando a MongoDB:', error));

export default app;
