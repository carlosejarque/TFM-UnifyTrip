const Joi = require('joi');

exports.invitationSchema = Joi.object({
  trip_id: Joi.number().integer().required(),
  token: Joi.string().max(64).required()
});
