const Joi = require('joi');

exports.tripSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow('', null).default(null),
  destination: Joi.string().min(2).max(100).allow('', null).default(null),
  start_date: Joi.date().allow('', null).default(null),
  end_date: Joi.date().allow('', null).default(null),
  image_url: Joi.string().uri().allow('', null),
  owner_id: Joi.number().integer()
});

