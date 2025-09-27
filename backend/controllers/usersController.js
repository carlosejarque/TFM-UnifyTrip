const User = require("../models/User");

exports.getUsers = async (req, res) => {
  const rows = await User.findAll();
  res.status(200).json(rows);
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }   
};

exports.getProfile = async (req, res) => {
  const userId = req.user.userId;
  const user = await User.findByPk(userId);
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
    if (user) {
        await user.destroy();
        res.status(200).json({ message: "User deleted successfully" });
    } else {
        res.status(404).json({ message: "User not found" });
    }      
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;
  const user = await User.findByPk(id);

    if (user) {
        await user.update({ username, email });
        res.status(200).json({ message: "User updated successfully" });
    } else {
        res.status(404).json({ message: "User not found" });
    }   
};