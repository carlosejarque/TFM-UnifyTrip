import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Calendar, Users, User, MessageCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import styles from "./JoinTripPage.module.css";
const API_URL = import.meta.env.VITE_API_URL;

interface TripInfo {
  id: number;
  title: string;
  destination: string;
  description: string;
  start_date: string;
  end_date: string;
}

interface InvitationInfo {
  id: number;
  custom_message?: string;
  expires_at: string;
  max_uses: number;
  current_uses: number;
  creator: {
    id: number;
    username: string;
  };
}

interface ValidationResponse {
  trip: TripInfo;
  invitation: InvitationInfo;
}

export const JoinTripPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [validationData, setValidationData] = useState<ValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (token) {
      validateInvitation();
    }
  }, [token]);

  const validateInvitation = async () => {
    try {
      const response = await axios.get(`${API_URL}/invitations/validate/${token}`);
      setValidationData(response.data);
    } catch (error: any) {
      const message = error.response?.data?.message || "Token de invitación inválido";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTrip = async () => {
    if (!isAuthenticated) {
      // Redirigir al login con redirect de vuelta
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setJoining(true);
    try {
      const response = await axios.post(`${API_URL}/invitations/accept/${token}`);
      toast.success("¡Te has unido al viaje exitosamente!");
      navigate(`/trips/${response.data.trip.id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al unirse al viaje";
      toast.error(message);
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingCard}>
          <div className={styles.spinner}></div>
          <p>Validando invitación...</p>
        </div>
      </div>
    );
  }

  if (error || !validationData) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <AlertCircle size={48} />
          <h1>Invitación inválida</h1>
          <p>{error || "No se pudo validar la invitación"}</p>
          <Link to="/" className={styles.homeButton}>
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const { trip, invitation } = validationData;
  const expired = isExpired(invitation.expires_at);

  if (expired) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <Clock size={48} />
          <h1>Invitación expirada</h1>
          <p>Esta invitación ha expirado y ya no es válida.</p>
          <Link to="/" className={styles.homeButton}>
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.invitationCard}>
        <div className={styles.header}>
          <h1>¡Has sido invitado a un viaje!</h1>
          <p>Te han invitado a unirte a esta aventura</p>
        </div>

        <div className={styles.tripInfo}>
          <div className={styles.tripTitle}>
            <h2>{trip.title}</h2>
          </div>

          <div className={styles.tripDetails}>
            <div className={styles.detail}>
              <MapPin size={20} />
              <span>{trip.destination}</span>
            </div>

            <div className={styles.detail}>
              <Calendar size={20} />
              <span>
                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
              </span>
            </div>

            <div className={styles.detail}>
              <User size={20} />
              <span>Invitado por {invitation.creator.username}</span>
            </div>

            <div className={styles.detail}>
              <Clock size={20} />
              <span>Expira el {formatDate(invitation.expires_at)}</span>
            </div>

            <div className={styles.detail}>
              <Users size={20} />
              <span>
                {invitation.current_uses} / {invitation.max_uses} personas se han unido
              </span>
            </div>
          </div>

          {trip.description && (
            <div className={styles.description}>
              <h3>Descripción del viaje</h3>
              <p>{trip.description}</p>
            </div>
          )}

          {invitation.custom_message && (
            <div className={styles.customMessage}>
              <MessageCircle size={20} />
              <div>
                <h4>Mensaje de {invitation.creator.username}</h4>
                <p>{invitation.custom_message}</p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {!isAuthenticated ? (
            <div className={styles.authPrompt}>
              <p>Necesitas iniciar sesión para unirte al viaje</p>
              <div className={styles.authButtons}>
                <Link 
                  to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
                  className={styles.loginButton}
                >
                  Iniciar sesión
                </Link>
                <Link 
                  to={`/register?redirect=${encodeURIComponent(window.location.pathname)}`}
                  className={styles.registerButton}
                >
                  Registrarse
                </Link>
              </div>
            </div>
          ) : (
            <div className={styles.joinPrompt}>
              <button 
                onClick={handleJoinTrip}
                disabled={joining}
                className={styles.joinButton}
              >
                {joining ? "Uniéndose..." : "Unirse al viaje"}
              </button>
              <Link to="/" className={styles.declineButton}>
                No, gracias
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};