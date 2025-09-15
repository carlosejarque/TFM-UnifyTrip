const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Trip = require('./Trip');

const Invitation = sequelize.define('Invitation', {
  trip_id: DataTypes.INTEGER,
  token: {
    type: DataTypes.STRING(64),
    unique: true,
    allowNull: false
  }
});

Trip.hasMany(Invitation, { foreignKey: 'trip_id' });
Invitation.belongsTo(Trip, { foreignKey: 'trip_id' });

module.exports = Invitation;
