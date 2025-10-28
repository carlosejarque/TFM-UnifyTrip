const Joi = require('joi');

exports.tripParticipantSchema = Joi.object({
  user_id: Joi.number().integer(),
  trip_id: Joi.number().integer().required()
});
