const express = require("express");
const router = express.Router();
const {
  generateInvitationForTrip,
  validateInvitationToken,
  acceptInvitation,
  getInvitationsByTripId,
  revokeInvitation
} = require("../controllers/invitationsController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateBody } = require("../middlewares/validateBody");
const { generateInvitationSchema } = require("../schemas/invitationSchema");

// Generar invitación para un viaje (con validación de campos opcionales)
router.post("/generate/:trip_id", authMiddleware, validateBody(generateInvitationSchema), generateInvitationForTrip);

// Validar token de invitación (pública - no requiere auth)
router.get("/validate/:token", validateInvitationToken);

// Aceptar invitación y unirse al viaje
router.post("/accept/:token", authMiddleware, acceptInvitation);

// Obtener invitaciones de un viaje específico
router.get("/trip/:trip_id", authMiddleware, getInvitationsByTripId);

// Revocar/eliminar invitación de un viaje
router.delete("/revoke/:trip_id", authMiddleware, revokeInvitation);

module.exports = router;
