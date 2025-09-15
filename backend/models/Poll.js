const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Trip = require('./Trip');
const User = require('./User');

const Poll = sequelize.define('Poll', {
  trip_id: DataTypes.INTEGER,
  created_by: DataTypes.INTEGER,
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  type: DataTypes.STRING,
  is_multiple: DataTypes.BOOLEAN
});

Trip.hasMany(Poll, { foreignKey: 'trip_id' });
Poll.belongsTo(Trip, { foreignKey: 'trip_id' });

User.hasMany(Poll, { foreignKey: 'created_by' });
Poll.belongsTo(User, { foreignKey: 'created_by' });

module.exports = Poll;
