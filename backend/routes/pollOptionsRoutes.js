const express = require("express");
const router = express.Router();
const {
  getPollOptions,
  getPollOptionById,
  createPollOption,
  updatePollOption,
  deletePollOption,
  getPollOptionByPollId,
  deletePollOptionsByPollId
} = require("../controllers/pollOptionsController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateBody } = require("../middlewares/validateBody");
const { pollOptionSchema } = require("../schemas/pollOptionSchema");

router.get("/", getPollOptions);
router.get("/:id", getPollOptionById);
router.get("/poll/:poll_id", getPollOptionByPollId);
router.post("/", authMiddleware, validateBody(pollOptionSchema), createPollOption);
router.put("/:id", authMiddleware, validateBody(pollOptionSchema), updatePollOption);
router.delete("/:id", authMiddleware, deletePollOption);
router.delete("/poll/:poll_id", authMiddleware, deletePollOptionsByPollId);

module.exports = router;
