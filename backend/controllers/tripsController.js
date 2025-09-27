const Trip = require("../models/Trip");

exports.getTrips = async (req, res) => {
  const rows = await Trip.findAll();
  res.json(rows);
};

exports.getUserTrips = async (req, res) => {
  try {
    const owner_id = req.user.userId;
    const trips = await Trip.findAll({ where: { owner_id } });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving trips" });
  }
};

exports.getTripById = async (req, res) => {
  const { id } = req.params;
  const trip = await Trip.findByPk(id);
  if (trip) {
    res.json(trip);
  } else {
    res.status(404).json({ message: "Trip not found" });
  }
};

exports.createTrip = async (req, res) => {
  const { title, description, destination, start_date, end_date, image_url } =
    req.body;
  const userId = req.user.userId;
  const trip = await Trip.create({
    title,
    description,
    destination,
    start_date,
    end_date,
    image_url,
    owner_id : userId,
  });
  res.status(201).json({ message: "Trip added successfully", trip });
};

exports.updateTrip = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const { title, description, destination, start_date, end_date, image_url } =
    req.body;
  const trip = await Trip.findByPk(id);

  if (trip) {
    await trip.update({
      title,
      description,
      destination,
      start_date,
      end_date,
      image_url,
      userId,
    });
    res.json({ message: "Trip updated successfully" });
  } else {
    res.status(404).json({ message: "Trip not found" });
  }
};

exports.deleteTrip = async (req, res) => {
  const { id } = req.params;
  const trip = await Trip.findByPk(id);

  if (trip) {
    await trip.destroy();
    res.json({ message: "Trip deleted successfully" });
  } else {
    res.status(404).json({ message: "Trip not found" });
  }
};
