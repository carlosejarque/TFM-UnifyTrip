const rateLimit = require('express-rate-limit');

const WINDOW_MINUTES = Number(process.env.WINDOW_MINUTES) || 15;
const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS) || 5;

const loginLimiter = rateLimit({
  windowMs: WINDOW_MINUTES * 60 * 1000,
  max: MAX_LOGIN_ATTEMPTS,
  message: {
    error: `Demasiados intentos de login. Vuelve a intentarlo en ${WINDOW_MINUTES} minutos.`
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = loginLimiter;
