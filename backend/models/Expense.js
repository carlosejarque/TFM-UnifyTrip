const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Trip = require('./Trip');
const User = require('./User');

const Expense = sequelize.define('Expense', {
  trip_id: DataTypes.INTEGER,
  description: DataTypes.STRING,
  amount: DataTypes.DECIMAL(10, 2),
  paid_by: DataTypes.INTEGER,
  category: DataTypes.STRING,
  date  : DataTypes.DATE
});

Trip.hasMany(Expense, { foreignKey: 'trip_id' });
Expense.belongsTo(Trip, { foreignKey: 'trip_id' });

User.hasMany(Expense, { foreignKey: 'paid_by' });
Expense.belongsTo(User, { foreignKey: 'paid_by' });

module.exports = Expense;