const Joi = require('joi');

exports.itinerarySchema = Joi.object({
  trip_id: Joi.number().integer().required()
});
