const { DataTypes } = require("sequelize");
const sequelize = require("./index");
const Itinerary = require("./Itinerary");
const User = require("./User");

const Activity = sequelize.define("Activity", {
  trip_id: DataTypes.INTEGER,
  itinerary_id: DataTypes.INTEGER,
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  start_date: DataTypes.DATE,
  end_date: DataTypes.DATE,
  created_by: DataTypes.INTEGER,
  location: DataTypes.STRING,
  generatedByAI: { type: DataTypes.BOOLEAN, defaultValue: false },
});

Itinerary.hasMany(Activity, { foreignKey: "itinerary_id" });
Activity.belongsTo(Itinerary, { foreignKey: "itinerary_id" });

User.hasMany(Activity, { foreignKey: "created_by" });
Activity.belongsTo(User, { foreignKey: "created_by" });

module.exports = Activity;
