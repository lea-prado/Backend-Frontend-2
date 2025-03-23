import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_jwt_secret';

// Estrategia Local para login
passport.use('local', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return done(null, false, { message: 'Usuario no encontrado' });
    }
    if (!user.comparePassword(password)) {
      return done(null, false, { message: 'Contraseña incorrecta' });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Cookie extractor personalizado
const cookieExtractor = (req) => {
  if (req && req.headers && req.headers.cookie) {
    // 'req.headers.cookie' es un string tipo: "jwt=token; otraCookie=valor;..."
    const cookies = req.headers.cookie.split(';');
    for (const c of cookies) {
      const [name, value] = c.trim().split('=');
      if (name === 'jwt') return value;
    }
  }
  return null;
};

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: JWT_SECRET
};

passport.use('jwt', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (!user) return done(null, false);
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));


export default passport;
