const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Poll = require('./Poll');
const PollOption = require('./PollOption');
const User = require('./User');

const Vote = sequelize.define('Vote', {
  poll_id: DataTypes.INTEGER,
  poll_option_id: DataTypes.INTEGER,
  user_id: DataTypes.INTEGER,
  value: DataTypes.INTEGER
});

Poll.hasMany(Vote, { foreignKey: 'poll_id' });
Vote.belongsTo(Poll, { foreignKey: 'poll_id' });

PollOption.hasMany(Vote, { foreignKey: 'poll_option_id' });
Vote.belongsTo(PollOption, { foreignKey: 'poll_option_id' });

User.hasMany(Vote, { foreignKey: 'user_id' });
Vote.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Vote;
