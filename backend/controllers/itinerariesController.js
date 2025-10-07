const e = require("express");
const Itinerary = require("../models/Itinerary");

exports.getItineraries = async (req, res) => {
  const rows = await Itinerary.findAll();
  res.json(rows);
};

exports.getItineraryById = async (req, res) => {
  const { id } = req.params;
  const itinerary = await Itinerary.findByPk(id);
  if (itinerary) {
    res.json(itinerary);
  } else {
    res.status(404).json({ message: "Itinerary not found" });
  }
};

exports.getItineraryByTripId = async (req, res) => {
  const { trip_id } = req.params;
  const itineraries = await Itinerary.findAll({ where: { trip_id } });
  if (itineraries.length > 0) {
    res.json(itineraries);
  } else {
    res.status(404).json({ message: "No itineraries found for this trip" });
  }
};

exports.createItinerary = async (req, res) => {
  const { trip_id } = req.body;
  const itinerary = await Itinerary.create({ trip_id });
  res.status(201).json({ message: "Itinerary added successfully", itinerary });
};

exports.updateItinerary = async (req, res) => {
  const { id } = req.params;
  const { trip_id } = req.body;
  const itinerary = await Itinerary.findByPk(id);

  if (itinerary) {
    await itinerary.update({ trip_id });
    res.json({ message: "Itinerary updated successfully" });
  } else {
    res.status(404).json({ message: "Itinerary not found" });
  }
};

exports.deleteItinerary = async (req, res) => {
  const { id } = req.params;
  const itinerary = await Itinerary.findByPk(id);

  if (itinerary) {
    await itinerary.destroy();
    res.json({ message: "Itinerary deleted successfully" });
  } else {
    res.status(404).json({ message: "Itinerary not found" });
  }
};
