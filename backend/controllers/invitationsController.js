const { Op } = require('sequelize');
const Trip = require('../models/Trip');
const TripParticipant = require('../models/TripParticipant');
const User = require('../models/User');
const Invitation = require('../models/Invitation');

const generateLinkToken = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// Generar código corto de 6 dígitos
const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Verificar que el token sea único
const generateUniqueToken = async () => {
  let token;
  let exists = true;
  
  while (exists) {
    token = generateLinkToken();
    const existing = await Invitation.findOne({ where: { token } });
    exists = !!existing;
  }
  
  return token;
};

// Verificar que el código sea único
const generateUniqueCode = async () => {
  let code;
  let exists = true;
  
  while (exists) {
    code = generateSixDigitCode();
    const existing = await Invitation.findOne({ where: { code } });
    exists = !!existing;
  }
  
  return code;
};

// Verificar si el usuario tiene acceso al viaje (es owner o participante)
const userHasAccessToTrip = async (userId, tripId) => {
  const trip = await Trip.findByPk(tripId);
  if (!trip) return false;
  
  // Es el owner
  if (trip.owner_id === userId) return true;
  
  // Es participante
  const participant = await TripParticipant.findOne({
    where: { trip_id: tripId, user_id: userId }
  });
  
  return !!participant;
};

// 1. Obtener o crear enlace de invitación
exports.getInviteLink = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.userId;

    // Verificar acceso
    const hasAccess = await userHasAccessToTrip(userId, tripId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'No tienes acceso a este viaje' });
    }

    // Buscar enlace activo existente
    let invitation = await Invitation.findOne({
      where: { 
        trip_id: tripId,
        status: 'active',
        expires_at: { [Op.gt]: new Date() }
      }
    });

    // Si no existe, crear uno nuevo
    if (!invitation) {
      const token = await generateUniqueToken();
      const code = await generateUniqueCode();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días

      invitation = await Invitation.create({
        trip_id: tripId,
        token,
        code,
        status: 'active',
        expires_at: expiresAt,
        created_by: userId
      });
    }

    return res.json({
      token: invitation.token,
      code: invitation.code,
      expiresAt: invitation.expires_at,
      link: `${process.env.FRONTEND_URL}/invitations/join/${invitation.token}`
    });
  } catch (error) {
    console.error('Error obteniendo enlace:', error);
    res.status(500).json({ message: 'Error al obtener enlace de invitación' });
  }
};

exports.generateNewInviteLink = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.userId;

    // Verificar acceso
    const hasAccess = await userHasAccessToTrip(userId, tripId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'No tienes acceso a este viaje' });
    }

    // Revocar enlace activo anterior
    await Invitation.update(
      { status: 'revoked' },
      { 
        where: { 
          trip_id: tripId,
          status: 'active'
        }
      }
    );

    // Crear nuevo enlace
    const token = await generateUniqueToken();
    const code = await generateUniqueCode();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const invitation = await Invitation.create({
      trip_id: tripId,
      token,
      code,
      status: 'active',
      expires_at: expiresAt,
      created_by: userId
    });

    return res.json({
      token: invitation.token,
      code: invitation.code,
      expiresAt: invitation.expires_at,
      link: `${process.env.FRONTEND_URL}/invitations/join/${invitation.token}`
    });
  } catch (error) {
    console.error('Error generando nuevo enlace:', error);
    res.status(500).json({ message: 'Error al generar nuevo enlace' });
  }
};

exports.validateInviteToken = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({
      where: { token },
      include: [
        {
          model: Trip,
          as: 'trip',
          attributes: ['id', 'title', 'destination', 'start_date', 'end_date'],
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'username', 'email']
            }
          ]
        }
      ]
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Enlace de invitación no válido' });
    }

    // Verificar estado
    if (invitation.status !== 'active') {
      return res.status(400).json({ message: 'Este enlace ha sido revocado' });
    }

    // Verificar expiración
    if (new Date() > new Date(invitation.expires_at)) {
      await invitation.update({ status: 'expired' });
      return res.status(400).json({ message: 'Este enlace ha expirado' });
    }

    return res.json({
      valid: true,
      trip: invitation.trip
    });
  } catch (error) {
    console.error('Error validando token:', error);
    res.status(500).json({ message: 'Error al validar invitación' });
  }
};

exports.acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user.userId;

    const invitation = await Invitation.findOne({
      where: { token },
      include: [{ model: Trip, as: 'Trip' }]
    });

    if (!invitation || invitation.status !== 'active') {
      return res.status(400).json({ message: 'Invitación no válida' });
    }

    if (new Date() > new Date(invitation.expires_at)) {
      await invitation.update({ status: 'expired' });
      return res.status(400).json({ message: 'La invitación ha expirado' });
    }

    // Verificar si ya es participante
    const existingParticipant = await TripParticipant.findOne({
      where: {
        trip_id: invitation.trip_id,
        user_id: userId
      }
    });

    if (existingParticipant) {
      return res.status(400).json({ message: 'Ya eres participante de este viaje' });
    }

    // Añadir como participante
    await TripParticipant.create({
      trip_id: invitation.trip_id,
      user_id: userId
    });

    return res.json({
      message: 'Te has unido al viaje exitosamente',
      trip: invitation.trip
    });
  } catch (error) {
    console.error('Error aceptando invitación:', error);
    res.status(500).json({ message: 'Error al aceptar invitación' });
  }
};

exports.findInvitationByCode = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code || code.length !== 6) {
      return res.status(400).json({ message: 'Código inválido. Debe tener 6 dígitos' });
    }

    const invitation = await Invitation.findOne({
      where: { 
        code,
        status: 'active',
        expires_at: { [Op.gt]: new Date() }
      }
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Código de invitación no válido o expirado' });
    }

    return res.json({
      token: invitation.token,
      tripId: invitation.trip_id
    });
  } catch (error) {
    console.error('Error buscando invitación por código:', error);
    res.status(500).json({ message: 'Error al buscar invitación' });
  }
};