const express = require('express');
const router = express.Router();
const { login, register, refresh } = require('../controllers/authController');
const {getUsers, getUserById, deleteUser, updateUser} = require('../controllers/usersController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const loginLimiter = require('../middlewares/loginLimiter');
const { validateBody } = require('../middlewares/validateBody');
const { registerSchema, loginSchema} = require('../schemas/userSchema');

router.get('/', authMiddleware, getUsers);
router.get('/:id', authMiddleware, getUserById);
router.delete('/:id', authMiddleware, deleteUser);
router.put('/:id', authMiddleware, validateBody(registerSchema), updateUser);

router.post('/login', loginLimiter, validateBody(loginSchema), login);
router.post('/register', validateBody(registerSchema), register);
router.post('/refresh', refresh);

module.exports = router;