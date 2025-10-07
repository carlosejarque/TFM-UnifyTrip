const express = require('express');
const router = express.Router();
const { validateInviteToken, getInviteLink, generateNewInviteLink, acceptInvitation, findInvitationByCode} = require('../controllers/invitationsController');
const { authMiddleware } = require("../middlewares/authMiddleware");

router.get('/join/:token', validateInviteToken);

router.get('/trips/:tripId/link', authMiddleware, getInviteLink);
router.post('/trips/:tripId/link', authMiddleware, generateNewInviteLink);
router.post('/join/:token/accept', authMiddleware, acceptInvitation);

router.get('/find-by-code/:code', authMiddleware, findInvitationByCode);

module.exports = router;