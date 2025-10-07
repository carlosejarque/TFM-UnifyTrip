const express = require("express");
const router = express.Router();
const {
  getItineraries,
  getItineraryById,
  getItineraryByTripId,
  createItinerary,
  updateItinerary,
  deleteItinerary
} = require("../controllers/itinerariesController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateBody } = require("../middlewares/validateBody");
const { itinerarySchema } = require("../schemas/itinerarySchema");

router.get("/", getItineraries);
router.get("/:id", getItineraryById);
router.get("/trip/:trip_id", getItineraryByTripId);
router.post("/", authMiddleware, validateBody(itinerarySchema), createItinerary);
router.put("/:id", authMiddleware, validateBody(itinerarySchema), updateItinerary);
router.delete("/:id", authMiddleware, deleteItinerary);

module.exports = router;
