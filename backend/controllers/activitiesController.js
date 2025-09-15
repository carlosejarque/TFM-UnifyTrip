const Activity = require("../models/Activity");

exports.getActivities = async (req, res) => {
  const rows = await Activity.findAll();
  if (rows.length === 0) {
    return res.status(200).json({ message: "No activities found" });
  }
  const orderedRows = rows.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  res.status(201).json(orderedRows);
};

exports.getActivityById = async (req, res) => {
  const { id } = req.params;
  const activity = await Activity.findByPk(id);
  if (activity) {
    res.json(activity);
  } else {
    res.status(404).json({ message: "Activity not found" });
  }
};

exports.getActivitiesByItineraryId = async (req, res) => {
  const { itinerary_id } = req.params;
  const activities = await Activity.findAll({ where: { itinerary_id } });
  if (activities.length > 0) {
    const orderedActivities = activities.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    res.json(orderedActivities);
  } else {
    res.status(200).json({ message: "No activities found for this itinerary" });
  }
};

exports.createActivity = async (req, res) => {
  const { trip_id, itinerary_id, name, description, start_date, end_date, created_by, location } = req.body;
  const activity = await Activity.create({
    trip_id,
    itinerary_id,
    name,
    description,
    start_date,
    end_date,
    created_by,
    location
  });
  res.status(201).json({ message: "Activity added successfully", activity });
};

exports.updateActivity = async (req, res) => {
  const { id } = req.params;
  const { trip_id, itinerary_id, name, description, start_date, end_date, created_by, location } = req.body;
  const activity = await Activity.findByPk(id);

  if (activity) {
    await activity.update({
      trip_id,
      itinerary_id,
      name,
      description,
      start_date,
      end_date,
      created_by,
      location
    });
    res.json({ message: "Activity updated successfully" });
  } else {
    res.status(404).json({ message: "Activity not found" });
  }
};

exports.deleteActivity = async (req, res) => {
  const { id } = req.params;
  const activity = await Activity.findByPk(id);

  if (activity) {
    await activity.destroy();
    res.json({ message: "Activity deleted successfully" });
  } else {
    res.status(404).json({ message: "Activity not found" });
  }
};
