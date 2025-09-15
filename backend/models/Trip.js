const {DataTypes} = require('sequelize');
const sequelize = require('./index');
const User = require('./User');

const Trip = sequelize.define('Trip', {
  title: DataTypes.STRING,
  description:{ type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  owner_id: DataTypes.INTEGER,
  destination: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  start_date: { type: DataTypes.DATEONLY, allowNull: true },
  end_date:{ type: DataTypes.DATEONLY, allowNull: true },
  image_url: DataTypes.STRING
});

User.hasMany(Trip, { foreignKey: 'owner_id' });
Trip.belongsTo(User, { foreignKey: 'owner_id' });

module.exports = Trip;
