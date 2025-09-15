const Vote = require("../models/Vote");
const Poll = require("../models/Poll");

exports.getVotes = async (req, res) => {
  const rows = await Vote.findAll();
  res.json(rows);
};

exports.getVoteById = async (req, res) => {
  const { id } = req.params;
  const vote = await Vote.findByPk(id);
  if (vote) {
    res.json(vote);
  } else {
    res.status(404).json({ message: "Vote not found" });
  }
};

exports.getVotesByPollId = async (req, res) => {
  const { poll_id } = req.params;
  const votes = await Vote.findAll({ where: { poll_id } });
  if (votes.length === 0) {
    return res.status(404).json({ message: "No votes found for this poll" });
  }
  res.json(votes);
}

exports.createVote = async (req, res) => {
  const { poll_id, poll_option_id, value } = req.body;
  const userId = req.user.userId;

  const poll = await Poll.findByPk(poll_id);
  if (!poll) {
    return res.status(200).json({ message: "Poll not found" });
  }

  if (!poll.is_multiple) {
    const existingVote = await Vote.findOne({ where: { poll_id, user_id: userId } });
    if (existingVote) {
      if (existingVote.poll_option_id === poll_option_id && existingVote.value === value) {
        await existingVote.destroy();
        return res.status(200).json({ message: "Vote removed successfully" });
      }
      await existingVote.destroy();
    }
  }

  if (poll.is_multiple) {
    const existingVote = await Vote.findOne({ where: { poll_id, poll_option_id, user_id: userId } });
    if (existingVote) {
      await existingVote.destroy();
      return res.status(200).json({ message: "Vote removed successfully" });
    }
  }

  const vote = await Vote.create({
    poll_id,
    poll_option_id,
    user_id : userId,
    value
  });
  res.status(201).json({ message: "Vote added successfully", vote });
};

exports.updateVote = async (req, res) => {
  const { id } = req.params;
  const { poll_id, poll_option_id, user_id, value } = req.body;
  const vote = await Vote.findByPk(id);

  if (vote) {
    await vote.update({
      poll_id,
      poll_option_id,
      user_id,
      value
    });
    res.json({ message: "Vote updated successfully" });
  } else {
    res.status(404).json({ message: "Vote not found" });
  }
};

exports.deleteVote = async (req, res) => {
  const { id } = req.params;
  const vote = await Vote.findByPk(id);

  if (vote) {
    await vote.destroy();
    res.json({ message: "Vote deleted successfully" });
  } else {
    res.status(404).json({ message: "Vote not found" });
  }
};
