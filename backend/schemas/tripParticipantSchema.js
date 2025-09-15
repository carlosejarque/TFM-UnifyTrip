const Joi = require('joi');

exports.tripParticipantSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  trip_id: Joi.number().integer().required()
});
