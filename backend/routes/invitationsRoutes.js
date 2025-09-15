const express = require("express");
const router = express.Router();
const {
  getInvitations,
  getInvitationById,
  createInvitation,
  updateInvitation,
  deleteInvitation
} = require("../controllers/invitationsController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateBody } = require("../middlewares/validateBody");
const { invitationSchema } = require("../schemas/invitationSchema");

router.get("/", getInvitations);
router.get("/:id", getInvitationById);
router.post("/", authMiddleware, validateBody(invitationSchema), createInvitation);
router.put("/:id", authMiddleware, validateBody(invitationSchema), updateInvitation);
router.delete("/:id", authMiddleware, deleteInvitation);

module.exports = router;
