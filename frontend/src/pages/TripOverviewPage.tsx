import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  Edit3,
  Users,
  X,
  Check,
  UserPlus,
} from "lucide-react";
import styles from "./TripOverviewPage.module.css";

type Trip = {
  id: number;
  title: string;
  description: string;
  owner_id: number;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
};

type Participant = {
  id: number;
  username: string;
  email: string;
  avatar?: string;
};

export function TripOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para edición
  const [isEditingDestination, setIsEditingDestination] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newDestination, setNewDestination] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isShowingParticipants, setIsShowingParticipants] = useState(false);

  // Función para formatear fechas a DD/MM/YYYY
  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");

        // Cargar datos del viaje
        const tripResponse = await axios.get(
          `http://localhost:3000/trips/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTrip(tripResponse.data);
        setNewDestination(tripResponse.data.destination || "");
        setNewStartDate(tripResponse.data.start_date || "");
        setNewEndDate(tripResponse.data.end_date || "");
        setNewDescription(tripResponse.data.description || "");

        const tripParticipants = await axios.get(
          `http://localhost:3000/trip-participants/trip/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        // Obtener datos completos de cada participante
        const participantIds = tripParticipants.data.map((tp: { user_id: number }) => tp.user_id);
        const participantsData = await Promise.all(
          participantIds.map(async (userId: number) => {
            const userResponse = await axios.get(
              `http://localhost:3000/users/${userId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            return userResponse.data;
          })
        );
        
        setParticipants(participantsData);
      } catch (err) {
        setError("No se pudo cargar el viaje.");
        console.error(err);
        setTrip(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  // Funciones para edición
  const handleSaveDestination = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/trips/${id}`,
        { destination: newDestination },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrip((prev) =>
        prev ? { ...prev, destination: newDestination } : null
      );
      setIsEditingDestination(false);
    } catch (err) {
      console.error("Error updating destination:", err);
    }
  };

  const handleSaveDates = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/trips/${id}`,
        { start_date: newStartDate, end_date: newEndDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrip((prev) =>
        prev
          ? {
              ...prev,
              start_date: newStartDate,
              end_date: newEndDate,
            }
          : null
      );
      setIsEditingDates(false);
    } catch (err) {
      console.error("Error updating dates:", err);
    }
  };

  const handleSaveDescription = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/trips/${id}`,
        { description: newDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrip((prev) =>
        prev ? { ...prev, description: newDescription } : null
      );
      setIsEditingDescription(false);
    } catch (err) {
      console.error("Error updating description:", err);
    }
  };

  const handleCancelEdit = () => {
    if (trip) {
      setNewDestination(trip.destination || "");
      setNewStartDate(trip.start_date || "");
      setNewEndDate(trip.end_date || "");
      setNewDescription(trip.description || "");
    }
    setIsEditingDestination(false);
    setIsEditingDates(false);
    setIsEditingDescription(false);
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.loadingSpinner} size={40} />
          <p className={styles.loadingText}>Cargando viaje...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className={styles.errorWrapper}>
        <div className={styles.errorContainer}>
          <AlertCircle className={styles.errorIcon} size={48} />
          <h3 className={styles.errorTitle}>¡Oops! Algo salió mal</h3>
          <p className={styles.errorText}>
            {error || "No se encontró el viaje."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className={styles.overviewWrapper}>
      <div className={styles.banner}>
        <div className={styles.bannerImageWrapper}>
          <img
            src={
              trip.image_url ||
              "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
            }
            alt={trip.destination || "Imagen del viaje"}
            className={styles.bannerImg}
          />
          <div className={styles.imageOverlay}></div>
        </div>
        <div className={styles.bannerInfo}>
          <h1 className={styles.tripTitle}>{trip.title}</h1>
          <div className={styles.bannerMeta}>
            <div className={styles.infoItem}>
              <MapPin className={styles.infoIcon} size={20} />
              <span className={styles.destination}>
                {trip.destination || (
                  <span className={styles.missing}>Sin destino</span>
                )}
              </span>
            </div>
            <div className={styles.infoItem}>
              <Calendar className={styles.infoIcon} size={20} />
              <span className={styles.dates}>
                {trip.start_date && trip.end_date ? (
                  `${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}`
                ) : (
                  <span className={styles.missing}>Sin fechas</span>
                )}
              </span>
            </div>
            <div className={styles.infoItem}>
              <Users className={styles.infoIcon} size={20} />
              <span className={styles.participantCount}>
                {participants.length} participante
                {participants.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Descripción */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <AlertCircle size={20} />
            Descripción del viaje
          </h3>
          <button
            onClick={() => setIsEditingDescription(true)}
            className={styles.editSectionBtn}
            title="Editar descripción"
          >
            <Edit3 size={16} />
          </button>
        </div>

        {isEditingDescription ? (
          <div className={styles.editSection}>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Añade una descripción para tu viaje..."
              className={styles.editTextarea}
              rows={4}
            />
            <div className={styles.editActions}>
              <button
                onClick={handleSaveDescription}
                className={styles.saveBtn}
              >
                <Check size={16} />
                Guardar
              </button>
              <button onClick={handleCancelEdit} className={styles.cancelBtn}>
                <X size={16} />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.sectionContent}>
            {trip.description ? (
              <p className={styles.sectionText}>{trip.description}</p>
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>
                  No hay descripción aún.
                  <button
                    onClick={() => setIsEditingDescription(true)}
                    className={styles.emptyAction}
                  >
                    Añade una descripción
                  </button>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección de Destino */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <MapPin size={20} />
            Destino
          </h3>
          <button
            onClick={() => setIsEditingDestination(true)}
            className={styles.editSectionBtn}
            title="Editar destino"
          >
            <Edit3 size={16} />
          </button>
        </div>

        {isEditingDestination ? (
          <div className={styles.editSection}>
            <input
              type="text"
              value={newDestination}
              onChange={(e) => setNewDestination(e.target.value)}
              placeholder="¿A dónde vais?"
              className={styles.editInput}
            />
            <div className={styles.editActions}>
              <button
                onClick={handleSaveDestination}
                className={styles.saveBtn}
              >
                <Check size={16} />
                Guardar
              </button>
              <button onClick={handleCancelEdit} className={styles.cancelBtn}>
                <X size={16} />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.sectionContent}>
            {trip.destination ? (
              <p className={styles.sectionText}>{trip.destination}</p>
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>
                  No hay destino seleccionado.
                  <button
                    onClick={() => setIsEditingDestination(true)}
                    className={styles.emptyAction}
                  >
                    Elegir destino
                  </button>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección de Fechas */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <Calendar size={20} />
            Fechas del viaje
          </h3>
          <button
            onClick={() => setIsEditingDates(true)}
            className={styles.editSectionBtn}
            title="Editar fechas"
          >
            <Edit3 size={16} />
          </button>
        </div>

        {isEditingDates ? (
          <div className={styles.editSection}>
            <div className={styles.dateInputs}>
              <div className={styles.dateField}>
                <label className={styles.dateLabel}>Fecha de inicio</label>
                <input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className={styles.editInput}
                />
              </div>
              <div className={styles.dateField}>
                <label className={styles.dateLabel}>Fecha de fin</label>
                <input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className={styles.editInput}
                />
              </div>
            </div>
            <div className={styles.editActions}>
              <button onClick={handleSaveDates} className={styles.saveBtn}>
                <Check size={16} />
                Guardar
              </button>
              <button onClick={handleCancelEdit} className={styles.cancelBtn}>
                <X size={16} />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.sectionContent}>
            {trip.start_date && trip.end_date ? (
              <p className={styles.sectionText}>
                Del {formatDate(trip.start_date)} al {formatDate(trip.end_date)}
              </p>
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>
                  No hay fechas seleccionadas.
                  <button
                    onClick={() => setIsEditingDates(true)}
                    className={styles.emptyAction}
                  >
                    Elegir fechas
                  </button>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección de Participantes */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <Users size={20} />
            Participantes ({participants.length})
          </h3>
          <button
            onClick={() => setIsShowingParticipants(!isShowingParticipants)}
            className={styles.editSectionBtn}
            title="Gestionar participantes"
          >
            <Users size={16} />
          </button>
        </div>

        <div className={styles.sectionContent}>
          <div className={styles.participantsPreview}>
            {participants.slice(0, 3).map((participant) => (
              <div key={participant.id} className={styles.participantAvatar}>
                {participant.avatar ? (
                  <img src={participant.avatar} alt={participant.username} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {participant.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))}
            {participants.length > 3 && (
              <div className={styles.moreParticipants}>
                +{participants.length - 3}
              </div>
            )}
          </div>
          <button
            onClick={() => setIsShowingParticipants(true)}
            className={styles.viewAllBtn}
          >
            Ver todos los participantes
          </button>
        </div>
      </div>

      {/* Modal de participantes */}
      {isShowingParticipants && (
        <div className={styles.participantsModal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Participantes del viaje</h3>
              <button
                onClick={() => setIsShowingParticipants(false)}
                className={styles.closeBtn}
              >
                <X size={20} />
              </button>
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
                    <h4>{participant.username}</h4>
                    <p>{participant.email}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className={styles.addParticipantBtn}>
              <UserPlus size={18} />
              Invitar participante
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
