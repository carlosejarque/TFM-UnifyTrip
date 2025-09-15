import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
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

export function TripOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3000/trips/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrip(response.data);
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

  if (loading) return <div className={styles.loading}>Cargando viaje...</div>;
  if (error || !trip) return <div className={styles.error}>{error || "No se encontró el viaje."}</div>;

  const faltaDestino = !trip.destination;
  const faltaFechas = !trip.start_date || !trip.end_date;

  return (
    <section className={styles.overviewWrapper}>
      <div className={styles.banner}>
        <img
          src={trip.image_url || "https://images.unsplash.com/photo-1506744038136-46273834b3fb"}
          alt={trip.destination || "Imagen del viaje"}
          className={styles.bannerImg}
        />
        <div className={styles.bannerInfo}>
          <h1 className={styles.tripTitle}>{trip.title}</h1>
          <p className={styles.destination}>
            {trip.destination || <span className={styles.missing}>Sin destino</span>}
          </p>
          <p className={styles.dates}>
            {(trip.start_date && trip.end_date)
              ? `${trip.start_date} - ${trip.end_date}`
              : <span className={styles.missing}>Sin fechas</span>
            }
          </p>
        </div>
      </div>

      {(faltaDestino || faltaFechas) && (
        <div className={styles.warningBlock}>
          <h3>¡Faltan datos clave para este viaje!</h3>
          <p>
            {faltaDestino && "Aún no se ha elegido destino. "}
            {faltaFechas && "Aún no se han elegido fechas."}
          </p>
          <div className={styles.actionBtns}>
            {faltaDestino && <button className={styles.primaryBtn}>Elegir destino</button>}
            {faltaFechas && <button className={styles.primaryBtn}>Elegir fechas</button>}
            <button className={styles.secondaryBtn}>Recomendar destino/fechas</button>
            <button className={styles.secondaryBtn}>Lanzar votación</button>
          </div>
        </div>
      )}

      <div className={styles.descBlock}>
        <h3>Descripción</h3>
        <p>{trip.description}</p>
      </div>
    </section>
  );
}
