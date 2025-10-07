const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Trip = require('./Trip');
const User = require('./User');

const Invitation = sequelize.define('Invitation', {
  trip_id: DataTypes.INTEGER,
  created_by: DataTypes.INTEGER,
  token: {
    type: DataTypes.STRING(64),
    unique: true,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'revoked'),
    defaultValue: 'active'
  },
  code: DataTypes.STRING(6),
  expires_at: DataTypes.DATE
});

Trip.hasMany(Invitation, { foreignKey: 'trip_id' });
Invitation.belongsTo(Trip, { foreignKey: 'trip_id' });

User.hasMany(Invitation, { foreignKey: 'created_by' });
Invitation.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });

module.exports = Invitation;