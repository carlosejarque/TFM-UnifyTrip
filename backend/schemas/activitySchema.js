const Joi = require('joi');

exports.activitySchema = Joi.object({
  trip_id: Joi.number().integer().required(),
  itinerary_id: Joi.number().integer().required(),
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow('', null),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  created_by: Joi.number().integer(),
  location: Joi.string().max(100).allow('', null)
});
