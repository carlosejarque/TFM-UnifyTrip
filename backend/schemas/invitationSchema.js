const Joi = require('joi');

// Esquema para generar invitación
exports.generateInvitationSchema = Joi.object({
  custom_message: Joi.string().max(500).allow('', null),
  expires_in_days: Joi.number().integer().min(1).max(365).default(7),
  max_uses: Joi.number().integer().min(1).max(100).default(1)
});

// Esquema básico (por compatibilidad)
exports.invitationSchema = Joi.object({
  trip_id: Joi.number().integer().required()
});
