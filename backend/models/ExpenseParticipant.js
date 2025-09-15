const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Expense = require('./Expense');
const User = require('./User');

const ExpenseParticipant = sequelize.define('ExpenseParticipant', {
  expense_id : DataTypes.INTEGER,
  user_id    : DataTypes.INTEGER,
  share_amount : DataTypes.DECIMAL(10, 2)
});

Expense.hasMany(ExpenseParticipant, { foreignKey: 'expense_id' });
ExpenseParticipant.belongsTo(Expense, { foreignKey: 'expense_id' });

User.hasMany(ExpenseParticipant, { foreignKey: 'user_id' });
ExpenseParticipant.belongsTo(User, { foreignKey: 'user_id' });

module.exports = ExpenseParticipant;