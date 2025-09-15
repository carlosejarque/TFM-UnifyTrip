const Invitation = require("../models/Invitation");

exports.getInvitations = async (req, res) => {
  const rows = await Invitation.findAll();
  res.json(rows);
};

exports.getInvitationById = async (req, res) => {
  const { id } = req.params;
  const invitation = await Invitation.findByPk(id);
  if (invitation) {
    res.json(invitation);
  } else {
    res.status(404).json({ message: "Invitation not found" });
  }
};

exports.createInvitation = async (req, res) => {
  const { trip_id, token } = req.body;
  const invitation = await Invitation.create({ trip_id, token });
  res.status(201).json({ message: "Invitation added successfully", invitation });
};

exports.updateInvitation = async (req, res) => {
  const { id } = req.params;
  const { trip_id, token } = req.body;
  const invitation = await Invitation.findByPk(id);

  if (invitation) {
    await invitation.update({ trip_id, token });
    res.json({ message: "Invitation updated successfully" });
  } else {
    res.status(404).json({ message: "Invitation not found" });
  }
};

exports.deleteInvitation = async (req, res) => {
  const { id } = req.params;
  const invitation = await Invitation.findByPk(id);

  if (invitation) {
    await invitation.destroy();
    res.json({ message: "Invitation deleted successfully" });
  } else {
    res.status(404).json({ message: "Invitation not found" });
  }
};
