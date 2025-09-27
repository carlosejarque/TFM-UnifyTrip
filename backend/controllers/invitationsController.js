const Invitation = require("../models/Invitation");
const Trip = require("../models/Trip");
const User = require("../models/User");
const TripParticipant = require("../models/TripParticipant");
const crypto = require("crypto");

// Generar invitación para un viaje
exports.generateInvitationForTrip = async (req, res) => {
  try {
    const { trip_id } = req.params;
    const { custom_message, expires_in_days = 7, max_uses = 1 } = req.body;
    const userId = req.user.userId;
    
    // Verificar que el viaje existe
    const trip = await Trip.findByPk(trip_id);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    
    // Verificar que el usuario es participante del viaje
    const isParticipant = await TripParticipant.findOne({
      where: { trip_id, user_id: userId }
    });
    
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not authorized to create invitations for this trip" });
    }
    
    // Verificar si ya existe una invitación activa para este viaje
    let existingInvitation = await Invitation.findOne({ 
      where: { 
        trip_id, 
        status: 'active' 
      } 
    });
    
    if (existingInvitation) {
      return res.status(200).json({ 
        message: "Active invitation already exists for this trip", 
        invitation: {
          id: existingInvitation.id,
          trip_id: existingInvitation.trip_id,
          token: existingInvitation.token,
          status: existingInvitation.status,
          expires_at: existingInvitation.expires_at,
          max_uses: existingInvitation.max_uses,
          current_uses: existingInvitation.current_uses,
          custom_message: existingInvitation.custom_message,
          invitationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join-trip/${existingInvitation.token}`
        }
      });
    }
    
    // Generar nuevo token único
    const token = crypto.randomBytes(32).toString('hex');
    
    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_in_days);
    
    const invitation = await Invitation.create({
      trip_id,
      created_by: userId,
      token,
      status: 'active',
      expires_at: expiresAt,
      max_uses,
      current_uses: 0,
      custom_message: custom_message || null
    });
    
    res.status(201).json({ 
      message: "Invitation generated successfully", 
      invitation: {
        id: invitation.id,
        trip_id: invitation.trip_id,
        token: invitation.token,
        status: invitation.status,
        expires_at: invitation.expires_at,
        max_uses: invitation.max_uses,
        current_uses: invitation.current_uses,
        custom_message: invitation.custom_message,
        invitationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join-trip/${invitation.token}`
      }
    });
  } catch (error) {
    console.error("Error in generateInvitationForTrip:", error);
    res.status(500).json({ message: "Error generating invitation" });
  }
};

// Validar token de invitación
exports.validateInvitationToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    const invitation = await Invitation.findOne({
      where: { token },
      include: [
        {
          model: Trip,
          attributes: ['id', 'title', 'destination', 'description', 'start_date', 'end_date']
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'username']
        }
      ]
    });
    
    if (!invitation) {
      return res.status(404).json({ message: "Invalid invitation token" });
    }
    
    // Verificar si la invitación ha expirado
    if (invitation.expires_at && new Date() > invitation.expires_at) {
      // Marcar como expirada si no lo está ya
      if (invitation.status !== 'expired') {
        await invitation.update({ status: 'expired' });
      }
      return res.status(400).json({ message: "Invitation has expired" });
    }
    
    // Verificar estado de la invitación
    if (invitation.status !== 'active') {
      return res.status(400).json({ 
        message: `Invitation is ${invitation.status}`,
        status: invitation.status
      });
    }
    
    // Verificar si ha alcanzado el máximo de usos
    if (invitation.current_uses >= invitation.max_uses) {
      await invitation.update({ status: 'used' });
      return res.status(400).json({ message: "Invitation has reached maximum uses" });
    }
    
    res.status(200).json({
      message: "Valid invitation token",
      trip: invitation.Trip,
      invitation: {
        id: invitation.id,
        custom_message: invitation.custom_message,
        expires_at: invitation.expires_at,
        max_uses: invitation.max_uses,
        current_uses: invitation.current_uses,
        creator: invitation.Creator
      }
    });
  } catch (error) {
    console.error("Error in validateInvitationToken:", error);
    res.status(500).json({ message: "Error validating invitation token" });
  }
};

// Aceptar invitación y unirse al viaje
exports.acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user.userId;
    
    // Buscar la invitación
    const invitation = await Invitation.findOne({
      where: { token },
      include: [Trip]
    });
    
    if (!invitation) {
      return res.status(404).json({ message: "Invalid invitation token" });
    }
    
    // Verificar si la invitación ha expirado
    if (invitation.expires_at && new Date() > invitation.expires_at) {
      if (invitation.status !== 'expired') {
        await invitation.update({ status: 'expired' });
      }
      return res.status(400).json({ message: "Invitation has expired" });
    }
    
    // Verificar estado de la invitación
    if (invitation.status !== 'active') {
      return res.status(400).json({ 
        message: `Invitation is ${invitation.status}` 
      });
    }
    
    // Verificar si ha alcanzado el máximo de usos
    if (invitation.current_uses >= invitation.max_uses) {
      await invitation.update({ status: 'used' });
      return res.status(400).json({ message: "Invitation has reached maximum uses" });
    }
    
    // Verificar si el usuario ya es participante del viaje
    const existingParticipant = await TripParticipant.findOne({
      where: { 
        trip_id: invitation.trip_id, 
        user_id: userId 
      }
    });
    
    if (existingParticipant) {
      return res.status(400).json({ message: "You are already a participant of this trip" });
    }
    
    // Añadir usuario como participante del viaje
    await TripParticipant.create({
      trip_id: invitation.trip_id,
      user_id: userId
    });
    
    // Incrementar el contador de usos
    const newUses = invitation.current_uses + 1;
    const updateData = { current_uses: newUses };
    
    // Si ha alcanzado el máximo de usos, marcar como usada
    if (newUses >= invitation.max_uses) {
      updateData.status = 'used';
      updateData.used_at = new Date();
    }
    
    await invitation.update(updateData);
    
    res.status(200).json({ 
      message: "Successfully joined the trip!", 
      trip: {
        id: invitation.Trip.id,
        title: invitation.Trip.title,
        destination: invitation.Trip.destination
      },
      invitation_status: updateData.status || 'active'
    });
  } catch (error) {
    console.error("Error in acceptInvitation:", error);
    res.status(500).json({ message: "Error accepting invitation" });
  }
};

// Obtener invitaciones de un viaje específico
exports.getInvitationsByTripId = async (req, res) => {
  try {
    const { trip_id } = req.params;
    const userId = req.user.userId;
    
    // Verificar que el usuario es participante del viaje
    const isParticipant = await TripParticipant.findOne({
      where: { trip_id, user_id: userId }
    });
    
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not authorized to view invitations for this trip" });
    }
    
    const invitations = await Invitation.findAll({
      where: { trip_id },
      include: [
        {
          model: Trip,
          attributes: ['id', 'title', 'destination']
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(invitations);
  } catch (error) {
    console.error("Error in getInvitationsByTripId:", error);
    res.status(500).json({ message: "Error retrieving trip invitations" });
  }
};

// Revocar/eliminar invitación
exports.revokeInvitation = async (req, res) => {
  try {
    const { trip_id } = req.params;
    const userId = req.user.userId;
    
    // Verificar que el usuario es participante del viaje
    const isParticipant = await TripParticipant.findOne({
      where: { trip_id, user_id: userId }
    });
    
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not authorized to revoke invitations for this trip" });
    }
    
    const invitation = await Invitation.findOne({ 
      where: { 
        trip_id,
        status: 'active'
      } 
    });
    
    if (invitation) {
      await invitation.update({ status: 'revoked' });
      res.status(200).json({ message: "Invitation revoked successfully" });
    } else {
      res.status(404).json({ message: "No active invitation found for this trip" });
    }
  } catch (error) {
    console.error("Error in revokeInvitation:", error);
    res.status(500).json({ message: "Error revoking invitation" });
  }
};
