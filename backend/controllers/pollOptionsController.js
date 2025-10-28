const PollOption = require("../models/PollOption");

exports.getPollOptions = async (req, res) => {
  const rows = await PollOption.findAll();
  res.json(rows);
};

exports.getPollOptionById = async (req, res) => {
  const { id } = req.params;
  const pollOption = await PollOption.findByPk(id);
  if (pollOption) {
    res.json(pollOption);
  } else {
    res.status(404).json({ message: "PollOption not found" });
  }
};

exports.getPollOptionByPollId = async (req, res) => {
  const { poll_id } = req.params;
  const pollOptions = await PollOption.findAll({ where: { poll_id } });
  if (pollOptions.length === 0) {
    return res.status(200).json({ message: "No poll options found for this poll" });
  }
  res.json(pollOptions);
}

exports.createPollOption = async (req, res) => {
  const { poll_id, label, start_date, end_date } = req.body;
  const pollOption = await PollOption.create({
    poll_id,
    label,
    start_date,
    end_date
  });
  res.status(201).json({ message: "PollOption added successfully", pollOption });
};

exports.updatePollOption = async (req, res) => {
  const { id } = req.params;
  const { poll_id, label, start_date, end_date } = req.body;
  const pollOption = await PollOption.findByPk(id);

  if (pollOption) {
    await pollOption.update({
      poll_id,
      label,
      start_date,
      end_date
    });
    res.json({ message: "PollOption updated successfully" });
  } else {
    res.status(404).json({ message: "PollOption not found" });
  }
};

exports.deletePollOption = async (req, res) => {
  const { id } = req.params;
  const pollOption = await PollOption.findByPk(id);

  if (pollOption) {
    await pollOption.destroy();
    res.json({ message: "PollOption deleted successfully" });
  } else {
    res.status(404).json({ message: "PollOption not found" });
  }
};

exports.deletePollOptionsByPollId = async (req, res) => {
  const { poll_id } = req.params;
  const pollOptions = await PollOption.findAll({ where: { poll_id } });

  if (pollOptions.length > 0) {
    await Promise.all(pollOptions.map(option => option.destroy()));
    res.json({ message: "Poll options deleted successfully" });
  }
  else {
    res.status(200).json({ message: "No poll options found for this poll" });
  }
};
