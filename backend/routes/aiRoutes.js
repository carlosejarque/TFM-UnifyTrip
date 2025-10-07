const express = require("express");
const router = express.Router();
const { recommendDestinations, generateItinerayWithAI } = require("../controllers/AIController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/recommend-destinations", authMiddleware, recommendDestinations);
router.post("/generate-itinerary", authMiddleware, generateItinerayWithAI);

module.exports = router;