const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Poll = require('./Poll');

const PollOption = sequelize.define('PollOption', {
  poll_id: DataTypes.INTEGER,
  label: DataTypes.STRING,
  start_date: DataTypes.DATEONLY,
  end_date: DataTypes.DATEONLY
});

Poll.hasMany(PollOption, { foreignKey: 'poll_id', onDelete: 'CASCADE' });
PollOption.belongsTo(Poll, { foreignKey: 'poll_id' });

module.exports = PollOption;
