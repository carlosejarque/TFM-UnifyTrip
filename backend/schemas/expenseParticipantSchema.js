const Joi = require('joi');

exports.expenseParticipantSchema = Joi.object({
    expense_id: Joi.number().integer().required(),
    user_id: Joi.number().integer().required(),
    share_amount: Joi.number().precision(2)
});