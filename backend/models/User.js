const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const User = sequelize.define('User', {
  username: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false}, 
  password: DataTypes.STRING,
  avatar_url: DataTypes.STRING
});

module.exports = User;
