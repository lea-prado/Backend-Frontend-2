import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { create } from 'express-handlebars';
import session from 'express-session';
import passport from 'passport';
import './config/passportStrategies.js';
import config from './config/db.js';
import sessionRoutes from './routes/sessions.routes.js';
import userRoutes from './routes/users.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar Handlebars
const hbs = create({
  extname: '.handlebars',
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// Rutas
app.use('/api/sessions', sessionRoutes);
app.use('/api/users', userRoutes);

// Conexión a MongoDB
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Conectado a MongoDB');
}).catch(error => console.error('Error conectando a MongoDB:', error));

app.get('/', (req, res) => {
  res.render('home', { title: 'Inicio' });
});

// Ruta para mostrar la vista de login
app.get('/login', (req, res) => res.render('login', { title: 'Iniciar Sesión' }));

// Ruta para mostrar la vista de registro
app.get('/register', (req, res) => res.render('register', { title: 'Registro' }));

// Ruta para mostrar el usuario actual (protegida con JWT)
app.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.render('current', { title: 'Usuario Actual', user: req.user });
});

// Exportar app para que server.js pueda importarlo
export default app;
