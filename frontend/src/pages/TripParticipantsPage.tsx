import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Users,
  Mail,
  Loader2,
  AlertCircle,
  Crown,
  Share2,
} from "lucide-react";
import styles from "./TripParticipantsPage.module.css";
import { ShareTripModal } from "../components/ShareTripModal";
const API_URL = import.meta.env.VITE_API_URL;

type Trip = {
  id: number;
  title: string;
  owner_id: number;
};

type Participant = {
  id: number;
  username: string;
  email: string;
  avatar?: string;
};

export function TripParticipantsPage() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");

        const tripResponse = await axios.get(
          `${API_URL}/trips/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTrip(tripResponse.data);

        const tripParticipants = await axios.get(
          `${API_URL}/trip-participants/trip/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const participantIds = tripParticipants.data.map(
          (tp: { user_id: number }) => tp.user_id
        );
        const participantsData = await Promise.all(
          participantIds.map(async (userId: number) => {
            const userResponse = await axios.get(
              `${API_URL}/users/${userId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            return userResponse.data;
          })
        );

        setParticipants(participantsData);
      } catch {
        setError("No se pudieron cargar los participantes.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <Loader2 className={styles.loadingSpinner} size={40} />
        <p>Cargando participantes...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className={styles.errorWrapper}>
        <AlertCircle className={styles.errorIcon} size={48} />
        <h3>Error al cargar participantes</h3>
        <p>{error || "No se encontró el viaje."}</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Users size={28} />
          <div>
            <h2 className={styles.pageTitle}>Participantes</h2>
            <p className={styles.pageSubtitle}>
              Gestiona quién puede ver y colaborar en este viaje
            </p>
          </div>
        </div>
        <button
          className={styles.shareButton}
          onClick={() => setShowShareModal(true)}
        >
          <Share2 size={18} />
          Compartir viaje
        </button>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            Miembros actuales ({participants.length})
          </h3>
        </div>

        <div className={styles.participantsList}>
          {participants.map((participant) => (
            <div key={participant.id} className={styles.participantCard}>
              <div className={styles.participantAvatar}>
                {participant.avatar ? (
                  <img src={participant.avatar} alt={participant.username} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {participant.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.participantInfo}>
                <div className={styles.participantNameRow}>
                  <h4 className={styles.participantName}>
                    {participant.username}
                  </h4>
                  {participant.id === trip.owner_id && (
                    <span className={styles.ownerBadge}>
                      <Crown size={14} />
                      Organizador
                    </span>
                  )}
                </div>
                <p className={styles.participantEmail}>
                  <Mail size={14} />
                  {participant.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ShareTripModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        tripId={trip.id}
        tripTitle={trip.title}
      />
    </div>
  );
}
