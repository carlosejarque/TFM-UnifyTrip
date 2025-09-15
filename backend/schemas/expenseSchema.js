const Joi = require("joi");

exports.expenseSchema = Joi.object({
  trip_id: Joi.number().integer().required(),
  description: Joi.string().min(2).max(255),
  amount: Joi.number().precision(2).required(),
  paid_by: Joi.number().integer(),
  category: Joi.string().max(100).allow("", null),
  date: Joi.date(),
});
