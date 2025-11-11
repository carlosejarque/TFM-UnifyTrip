const Joi = require('joi');

exports.pollSchema = Joi.object({
  trip_id: Joi.number().integer().required(),
  created_by: Joi.number().integer(),
  title: Joi.string().min(2).max(255),
  description: Joi.string().allow('', null),
  type: Joi.string(),
  is_multiple: Joi.boolean()
});
