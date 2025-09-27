const express = require("express");
const router = express.Router();
const { recommendDestinations } = require("../controllers/AIController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/recommend-destinations", authMiddleware, recommendDestinations);

module.exports = router;