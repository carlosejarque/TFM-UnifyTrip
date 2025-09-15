const TripParticipant = require("../models/TripParticipant");

exports.getTripParticipants = async (req, res) => {
  const rows = await TripParticipant.findAll();
  res.json(rows);
};

exports.getTripParticipantById = async (req, res) => {
  const { id } = req.params;
  const tripParticipant = await TripParticipant.findByPk(id);
  if (tripParticipant) {
    res.json(tripParticipant);
  } else {
    res.status(404).json({ message: "TripParticipant not found" });
  }
};

exports.getTripParticipantsByTripId = async (req, res) => {
  const { trip_id } = req.params;
  const tripParticipants = await TripParticipant.findAll({
    where: { trip_id },
  });
  res.json(tripParticipants);
};

exports.getTripParticipantByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const tripParticipants = await TripParticipant.findAll({ where: { user_id } });
    if (tripParticipants.length > 0) {
      res.status(200).json(tripParticipants);
    } else {
      res.status(200).json({ message: "No trip participants found for this user", data: [] });
    }
  } catch (err) {
    console.error("Error in getTripParticipantByUserId:", err);
    res.status(500).json({ message: "Error retrieving trip participants" });
  }
};

exports.getTripParticipantByMyUserId = async (req, res) => {
  try {
    
    const user_id = req.user.userId;    
    const tripParticipants = await TripParticipant.findAll({
      where: { user_id },
      attributes: ['trip_id']
    });
    
    if (tripParticipants.length > 0) {
      const tripIds = tripParticipants.map(participant => participant.trip_id);
      res.status(200).json({ tripIds });
    } else {
      res.status(200).json({ message: "No trip participants found for this user", tripIds: [] });
    }
  } catch (err) {
    console.error("Error in getTripParticipantByMyUserId:", err);
    res.status(500).json({ message: "Error retrieving trip participants" });
  }
};

exports.createTripParticipant = async (req, res) => {
  const { trip_id } = req.body;
  const user_id = req.user.id;
  const tripParticipant = await TripParticipant.create({ user_id, trip_id });
  res
    .status(201)
    .json({ message: "TripParticipant added successfully", tripParticipant });
};

exports.updateTripParticipant = async (req, res) => {
  const { id } = req.params;
  const { trip_id } = req.body;
  const user_id = req.user.id;
  const tripParticipant = await TripParticipant.findByPk(id);

  if (tripParticipant) {
    await tripParticipant.update({ user_id, trip_id });
    res.json({ message: "TripParticipant updated successfully" });
  } else {
    res.status(404).json({ message: "TripParticipant not found" });
  }
};

exports.deleteTripParticipant = async (req, res) => {
  const { id } = req.params;
  const tripParticipant = await TripParticipant.findByPk(id);

  if (tripParticipant) {
    await tripParticipant.destroy();
    res.json({ message: "TripParticipant deleted successfully" });
  } else {
    res.status(404).json({ message: "TripParticipant not found" });
  }
};
