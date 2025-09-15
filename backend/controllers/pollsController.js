const Poll = require("../models/Poll");

exports.getPolls = async (req, res) => {
  const rows = await Poll.findAll();
  res.json(rows);
};

exports.getPollById = async (req, res) => {
  const { id } = req.params;
  const poll = await Poll.findByPk(id);
  if (poll) {
    res.json(poll);
  } else {
    res.status(404).json({ message: "Poll not found" });
  }
};

exports.getPollByTripId = async (req, res) => {
  const { trip_id } = req.params;
  const polls = await Poll.findAll({ where: { trip_id } });
  if (polls.length > 0) {
    res.json(polls);
  } else {
    res.status(200).json({ message: "No polls found for this trip" });
  }
};

exports.createPoll = async (req, res) => {
  const { trip_id, title, description, type, is_multiple } = req.body;
  const userId = req.user.userId;
  const poll = await Poll.create({
    trip_id,
    created_by: userId,
    title,
    description,
    type,
    is_multiple
  });
  res.status(201).json({ message: "Poll added successfully", poll });
};

exports.updatePoll = async (req, res) => {
  const { id } = req.params;
  const { trip_id, created_by, title, description, type, is_multiple } = req.body;
  const poll = await Poll.findByPk(id);

  if (poll) {
    await poll.update({
      trip_id,
      created_by,
      title,
      description,
      type,
      is_multiple
    });
    res.json({ message: "Poll updated successfully" });
  } else {
    res.status(404).json({ message: "Poll not found" });
  }
};

exports.deletePoll = async (req, res) => {
  const { id } = req.params;
  const poll = await Poll.findByPk(id);

  if (poll) {
    await poll.destroy();
    res.json({ message: "Poll deleted successfully" });
  } else {
    res.status(404).json({ message: "Poll not found" });
  }
};
