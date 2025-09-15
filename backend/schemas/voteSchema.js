const Joi = require('joi');

exports.voteSchema = Joi.object({
  poll_id: Joi.number().integer().required(),
  poll_option_id: Joi.number().integer().required(),
  user_id: Joi.number().integer(),
  value: Joi.number().integer().valid(0, 1).required()
});
