const express = require("express");
const router = express.Router();
const {
  getTripParticipants,
  getTripParticipantById,
  getTripParticipantsByTripId,
  getTripParticipantByUserId,
  getTripParticipantByMyUserId,
  createTripParticipant,
  updateTripParticipant,
  deleteTripParticipant
} = require("../controllers/tripParticipantsController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateBody } = require("../middlewares/validateBody");
const { tripParticipantSchema } = require("../schemas/tripParticipantSchema");

router.get("/", getTripParticipants);
router.get("/my", authMiddleware, getTripParticipantByMyUserId);
router.get("/trip/:trip_id", getTripParticipantsByTripId);
router.get("/user/:user_id", authMiddleware, getTripParticipantByUserId);
router.get("/:id", getTripParticipantById);
router.post("/", authMiddleware, validateBody(tripParticipantSchema), createTripParticipant);
router.put("/:id", authMiddleware, validateBody(tripParticipantSchema), updateTripParticipant);
router.delete("/:id", authMiddleware, deleteTripParticipant);

module.exports = router;
