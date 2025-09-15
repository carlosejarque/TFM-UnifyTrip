const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Trip = require('./Trip');

const Itinerary = sequelize.define('Itinerary', {
  trip_id: DataTypes.INTEGER,
});

Trip.hasMany(Itinerary, { foreignKey: 'trip_id' });
Itinerary.belongsTo(Trip, { foreignKey: 'trip_id' });

module.exports = Itinerary;
