const express = require("express");
const router = express.Router();
const {
  getPolls,
  getPollById,
  createPoll,
  updatePoll,
  deletePoll,
  getPollByTripId
} = require("../controllers/pollsController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateBody } = require("../middlewares/validateBody");
const { pollSchema } = require("../schemas/pollSchema");

router.get("/", getPolls);
router.get("/:id", getPollById);
router.get("/trip/:trip_id", getPollByTripId);
router.post("/", authMiddleware, validateBody(pollSchema), createPoll);
router.put("/:id", authMiddleware, validateBody(pollSchema), updatePoll);
router.delete("/:id", authMiddleware, deletePoll);

module.exports = router;
