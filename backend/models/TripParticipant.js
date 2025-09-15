const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const User = require('./User');
const Trip = require('./Trip');

const TripParticipant = sequelize.define('TripParticipant', {
  user_id: DataTypes.INTEGER,
  trip_id: DataTypes.INTEGER
});

User.belongsToMany(Trip, { through: TripParticipant, foreignKey: 'user_id' });
Trip.belongsToMany(User, { through: TripParticipant, foreignKey: 'trip_id' });

module.exports = TripParticipant;
