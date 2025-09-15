const Joi = require('joi');

exports.pollOptionSchema = Joi.object({
  poll_id: Joi.number().integer().required(),
  label: Joi.string().max(255).allow('', null),
  start_date: Joi.date().allow(null),
  end_date: Joi.date().allow(null)
});
