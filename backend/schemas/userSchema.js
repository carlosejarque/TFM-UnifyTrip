const Joi = require('joi');

exports.registerSchema = Joi.object({
  username: Joi.string().min(2).max(100),
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(6).max(100).required()
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});
