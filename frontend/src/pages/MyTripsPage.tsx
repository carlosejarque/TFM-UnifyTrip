import { useEffect, useState } from "react";
import { TripCard } from "../components/TripCard";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Plane
} from "lucide-react";
import styles from "./MyTripsPage.module.css";
import axios from "axios";

type Trip = {
  id: number;
  title: string;
  description: string;
  destination: string;
  start_date: string;
  end_date: string;
  image_url: string;
};

function getTripStatus(
  startDate: string,
  endDate: string
): "past" | "active" | "upcoming" {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < now) return "past";
  if (start > now) return "upcoming";
  return "active";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

export function MyTripsPage() {
  const isLoggedIn = !!localStorage.getItem("token");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        
        const participantsResponse = await axios.get("http://localhost:3000/trip-participants/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const tripIds = participantsResponse.data.tripIds;
        
        if (Array.isArray(tripIds) && tripIds.length > 0) {
          const tripDetailsPromises = tripIds.map(tripId => 
            axios.get(`http://localhost:3000/trips/${tripId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          );
          
          const tripDetailsResponses = await Promise.all(tripDetailsPromises);
          const tripsData = tripDetailsResponses.map(response => response.data);
          setTrips(tripsData);
        } else {
          setTrips([]);
        }
      } catch (err) {
        setError("No se pudieron cargar los viajes. ¿Sesión expirada?");
        console.error("Error fetching trips:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  if (!isLoggedIn) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loginPromptBox}>
          <p className={styles.loginPromptText}>
            <strong>Inicia sesión</strong> para consultar tus viajes o crear uno
            nuevo.
          </p>
          <Link to="/login" className={styles.loginBtn}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.loadingSpinner} size={40} />
          <p className={styles.loadingText}>Cargando tus viajes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.errorContainer}>
          <AlertCircle className={styles.errorIcon} size={48} />
          <div className={styles.error}>{error}</div>
          <Link to="/login" className={styles.loginBtn}>
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  const upcoming = trips.filter(
    (t) => getTripStatus(t.start_date, t.end_date) === "upcoming"
  );
  const active = trips.filter(
    (t) => getTripStatus(t.start_date, t.end_date) === "active"
  );
  const past = trips.filter(
    (t) => getTripStatus(t.start_date, t.end_date) === "past"
  );

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <Plane className={styles.titleIcon} size={32} />
            <h1 className={styles.title}>Mis Viajes</h1>
          </div>
          <Link to="/newtrip" className={styles.newTripBtn}>
            Empezar un nuevo viaje
          </Link>
        </div>

        {active.length > 0 && (
          <>
            <div className={styles.sectionHeader}>
              <Clock className={styles.sectionIcon} size={20} />
              <h3 className={styles.sectionTitle}>En curso</h3>
              <span className={styles.sectionBadge}>{active.length}</span>
            </div>
            <div className={styles.cardGrid}>
              {active.map((trip) => (
                <TripCard
                  key={trip.id}
                  title={trip.title}
                  dates={`${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}`}
                  image={trip.image_url}
                  to={`/trips/${trip.id}`}
                />
              ))}
            </div>
          </>
        )}

        <div className={styles.sectionHeader}>
          <Calendar className={styles.sectionIcon} size={20} />
          <h3 className={styles.sectionTitle}>Próximamente</h3>
          <span className={styles.sectionBadge}>{upcoming.length}</span>
        </div>
        <div className={styles.cardGrid}>
          {upcoming.length > 0 ? (
            upcoming.map((trip) => (
              <TripCard
                key={trip.id}
                title={trip.title}
                dates={`${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}`}
                image={trip.image_url}
                to={`/trips/${trip.id}`}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <MapPin className={styles.emptyIcon} size={48} />
              <p className={styles.emptyText}>No tienes viajes próximos</p>
              <p className={styles.emptySubtext}>¡Planifica tu próxima aventura!</p>
              <Link to="/newtrip" className={styles.emptyAction}>
                Crear nuevo viaje
              </Link>
            </div>
          )}
        </div>

        <div className={styles.sectionHeader}>
          <CheckCircle2 className={styles.sectionIcon} size={20} />
          <h3 className={styles.sectionTitle}>Anteriormente</h3>
          <span className={styles.sectionBadge}>{past.length}</span>
        </div>
        <div className={styles.cardGrid}>
          {past.length > 0 ? (
            past.map((trip) => (
              <TripCard
                key={trip.id}
                title={trip.title}
                dates={`${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}`}
                image={trip.image_url}
                to={`/trips/${trip.id}`}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <CheckCircle2 className={styles.emptyIcon} size={48} />
              <p className={styles.emptyText}>Aún no has completado ningún viaje</p>
              <p className={styles.emptySubtext}>Tus aventuras pasadas aparecerán aquí</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
