const express = require("express");
const router = express.Router();
const {
  getVotes,
  getVoteById,
  createVote,
  updateVote,
  deleteVote,
  getVotesByPollId
} = require("../controllers/votesController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateBody } = require("../middlewares/validateBody");
const { voteSchema } = require("../schemas/voteSchema");

router.get("/", getVotes);
router.get("/:id", getVoteById);
router.get("/poll/:poll_id", getVotesByPollId);
router.post("/", authMiddleware, validateBody(voteSchema), createVote);
router.put("/:id", authMiddleware, validateBody(voteSchema), updateVote);
router.delete("/:id", authMiddleware, deleteVote);

module.exports = router;
