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
  Sparkles,
} from "lucide-react";
import styles from "./TripOverviewPage.module.css";
import { AIPreferencesModal } from "../components/AIDestinationForm";
const API_URL = import.meta.env.VITE_API_URL;

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

type AIDestination = {
  name: string;
  description: string;
  whyRecommended: string;
  recommendedActivities: string[];
  estimatedCostRange: {
    min: number;
    max: number;
    currency: string;
  };
  climateConditions: string;
  seasonalAdvantages: string;
};

export function TripOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDestination, setIsEditingDestination] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<AIDestination[]>([]);
  const [showAIModal, setShowAIModal] = useState(false);

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

        const tripResponse = await axios.get(
          `${API_URL}/trips/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTrip(tripResponse.data);
        setNewTitle(tripResponse.data.title || "");
        setNewDestination(tripResponse.data.destination || "");
        setNewStartDate(tripResponse.data.start_date || "");
        setNewEndDate(tripResponse.data.end_date || "");
        setNewDescription(tripResponse.data.description || "");

        const tripParticipants = await axios.get(
          `${API_URL}/trip-participants/trip/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        const participantIds = tripParticipants.data.map((tp: { user_id: number }) => tp.user_id);
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
        setError("No se pudo cargar el viaje.");
        setTrip(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const getDestinationRecommendations = async () => {
    setShowAIModal(true);
  };

  const handleAIPreferences = async (preferences: {
    startDate: string;
    endDate: string;
    climate: string[];
    experience: string[];
    distance: string;
    minBudget: string;
    maxBudget: string;
    travelStyle: string;
    numberOfTravelers: number;
    interests: string[];
    additionalInfo: string;
  }) => {
    setIsLoadingRecommendations(true);
    setShowAIModal(false);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/AI/recommend-destinations`,
        preferences,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.data.success && response.data.data.destinations) {
        setRecommendations(response.data.data.destinations);
      } else {
        setRecommendations([]);
      }
      setShowRecommendations(true);
    } catch {
      setRecommendations([]);
      setShowRecommendations(true);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const getUnsplashImage = async (destination: string): Promise<string | null> => {
    try {
      const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY; 
      const response = await axios.get(
        `https://api.unsplash.com/search/photos?client_id=${UNSPLASH_ACCESS_KEY}&query=${encodeURIComponent(
          destination
        )}&orientation=landscape&per_page=1`
      );
      
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].urls.regular;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleSaveDestination = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const newImageUrl = await getUnsplashImage(newDestination);
      
      const updateData: {
        title?: string;
        destination: string;
        image_url?: string;
      } = {
        title: trip?.title,
        destination: newDestination
      };
      
      if (newImageUrl) {
        updateData.image_url = newImageUrl;
      }
      
      await axios.put(
        `${API_URL}/trips/${id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTrip((prev) =>
        prev ? { 
          ...prev, 
          destination: newDestination,
          ...(newImageUrl && { image_url: newImageUrl })
        } : null
      );
      setIsEditingDestination(false);
    } catch {
      return;
    }
  };

  const handleSaveDates = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/trips/${id}`,
        { title: trip?.title, start_date: newStartDate, end_date: newEndDate },
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
    } catch {
      return;
    }
  };

  const handleSaveTitle = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/trips/${id}`,
        { title: newTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrip((prev) =>
        prev ? { ...prev, title: newTitle } : null
      );
      setIsEditingTitle(false);
    } catch {
      return;
    }
  };

  const handleSaveDescription = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/trips/${id}`,
        { description: newDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrip((prev) =>
        prev ? { ...prev, description: newDescription } : null
      );
      setIsEditingDescription(false);
    } catch {
      return;
    }
  };

  const handleCancelEdit = () => {
    if (trip) {
      setNewTitle(trip.title || "");
      setNewDestination(trip.destination || "");
      setNewStartDate(trip.start_date || "");
      setNewEndDate(trip.end_date || "");
      setNewDescription(trip.description || "");
    }
    setIsEditingTitle(false);
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
          <div className={styles.titleContainer}>
            {isEditingTitle ? (
              <div className={styles.editTitleSection}>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Título del viaje"
                  className={styles.editTitleInput}
                />
                <div className={styles.titleActions}>
                  <button
                    onClick={handleSaveTitle}
                    className={styles.saveTitleBtn}
                    title="Guardar título"
                  >
                    <Check size={16} />
                  </button>
                  <button 
                    onClick={handleCancelEdit} 
                    className={styles.cancelTitleBtn}
                    title="Cancelar edición"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.titleDisplay}>
                <h1 className={styles.tripTitle}>{trip.title}</h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className={styles.editTitleBtn}
                  title="Editar título"
                >
                  <Edit3 size={16} />
                </button>
              </div>
            )}
          </div>
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

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <MapPin size={20} />
            Destino
          </h3>
          <div className={styles.sectionActions}>
            <button
              onClick={getDestinationRecommendations}
              className={styles.aiHeaderBtn}
              disabled={isLoadingRecommendations}
              title="Obtener recomendaciones de destino con IA"
            >
              {isLoadingRecommendations ? (
                <Loader2 size={16} className={styles.aiSpinner} />
              ) : (
                <Sparkles size={16} />
              )}
            </button>
            <button
              onClick={() => setIsEditingDestination(true)}
              className={styles.editSectionBtn}
              title="Editar destino"
            >
              <Edit3 size={16} />
            </button>
          </div>
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

        {isLoadingRecommendations && (
          <div className={styles.recommendationsContainer}>
            <div className={styles.loadingRecommendations}>
              <div className={styles.loadingSpinner}>
                <Loader2 size={32} className={styles.aiSpinner} />
              </div>
              <h4 className={styles.loadingTitle}>
                <Sparkles size={20} />
                Generando recomendaciones personalizadas...
              </h4>
              <p className={styles.loadingText}>
                Nuestro asistente de IA está analizando tus preferencias para encontrar los destinos perfectos
              </p>
            </div>
          </div>
        )}

        {showRecommendations && recommendations.length > 0 && !isLoadingRecommendations && (
          <div className={styles.recommendationsContainer}>
            <div className={styles.recommendationsHeader}>
              <h4 className={styles.recommendationsTitle}>
                <Sparkles size={20} />
                Recomendaciones de destinos personalizadas ({recommendations.length})
              </h4>
              <button
                onClick={() => setShowRecommendations(false)}
                className={styles.closeRecommendationsBtn}
                title="Cerrar recomendaciones"
              >
                <X size={16} />
              </button>
            </div>
            <div className={styles.recommendationsContent}>
              <div className={styles.destinationsGrid}>
                {recommendations.map((destination, index) => (
                  <div key={index} className={styles.destinationCard}>
                    <div className={styles.destinationHeader}>
                      <button
                        onClick={() => {
                          setNewDestination(destination.name);
                          setIsEditingDestination(true);
                          setShowRecommendations(false);
                        }}
                        className={styles.destinationTitle}
                        title={`Seleccionar ${destination.name} como destino`}
                      >
                        <MapPin size={18} />
                        {destination.name}
                      </button>
                    </div>
                    
                    <p className={styles.destinationDescription}>
                      {destination.description}
                    </p>
                    
                    <div className={styles.whyRecommended}>
                      <h5>¿Por qué te lo recomendamos?</h5>
                      <p>{destination.whyRecommended}</p>
                    </div>
                    
                    <div className={styles.costInfo}>
                      <span className={styles.costLabel}>💰 Presupuesto estimado:</span>
                      <span className={styles.costRange}>
                        {destination.estimatedCostRange.min}€ - {destination.estimatedCostRange.max}€
                      </span>
                    </div>
                    
                    <div className={styles.activitiesSection}>
                      <h5>Actividades recomendadas:</h5>
                      <ul className={styles.activitiesList}>
                        {destination.recommendedActivities.slice(0, 3).map((activity, actIndex) => (
                          <li key={actIndex}>{activity}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className={styles.climateInfo}>
                      <div className={styles.climateConditions}>
                        <span className={styles.climateLabel}>🌤️ Clima esperado:</span>
                        <p>{destination.climateConditions}</p>
                      </div>
                      <div className={styles.seasonalAdvantages}>
                        <span className={styles.seasonalLabel}>⭐ Ventajas de la época:</span>
                        <p>{destination.seasonalAdvantages}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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

      <AIPreferencesModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onGenerate={handleAIPreferences}
        tripDates={trip ? {
          startDate: trip.start_date || "",
          endDate: trip.end_date || ""
        } : undefined}
      />
    </section>
  );
}
