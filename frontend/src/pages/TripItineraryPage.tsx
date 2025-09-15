import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./TripItineraryPage.module.css";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Bot,
  AlertTriangle,
  X,
  Trash2,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

type Trip = {
  id: number;
  title: string;
  destination?: string | null;
  start_date: string | null;
  end_date: string | null;
};

type Itinerary = {
  id: number;
  trip_id: number;
};

type Activity = {
  id: number;
  trip_id: number;
  itinerary_id: number;
  name: string;
  description?: string | null;
  start_date: string; // ISO string - coincide con el backend
  end_date: string; // ISO string - coincide con el backend
  created_by: number;
  location?: string | null;
};

export function TripItineraryPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to get min/max dates for datetime-local inputs
  const getDateLimits = () => {
    if (!trip?.start_date || !trip?.end_date) {
      return { min: "", max: "" };
    }

    // Convert YYYY-MM-DD to YYYY-MM-DDTHH:MM format for datetime-local
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);

    // Set start of day for minimum date
    const minDateTime = new Date(startDate);
    minDateTime.setHours(0, 0, 0, 0);

    // Set end of day for maximum date
    const maxDateTime = new Date(endDate);
    maxDateTime.setHours(23, 59, 59, 999);

    return {
      min: minDateTime.toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:MM
      max: maxDateTime.toISOString().slice(0, 16),
    };
  };

  // Estados para el formulario de nueva actividad
  const [activityFormData, setActivityFormData] = useState({
    name: "",
    description: "",
    start_datetime: "",
    end_datetime: "",
    location: "",
    itinerary_id: 0,
  });

  useEffect(() => {
    const loadItineraryData = async () => {
      if (!tripId) return;

      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");

        // 1. Cargar información del trip
        const tripResponse = await axios.get(
          `http://localhost:3000/trips/${tripId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const tripData = tripResponse.data;
        setTrip(tripData);

        // 2. Verificar si el trip tiene fechas definidas
        if (!tripData.start_date || !tripData.end_date) {
          setError(
            "Define las fechas del viaje primero para ver el itinerario. Ve a la página de detalles del viaje."
          );
          setLoading(false);
          return;
        }

        // 3. Cargar itinerario (debe existir ya que se crea con el trip)
        const itineraryResponse = await axios.get(
          `http://localhost:3000/itineraries/trip/${tripId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const itineraryData = Array.isArray(itineraryResponse.data)
          ? itineraryResponse.data[0]
          : itineraryResponse.data;
        setItinerary(itineraryData);

        // 4. Cargar actividades
        try {
          const activitiesResponse = await axios.get(
            `http://localhost:3000/activities/itinerary/${itineraryData.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const activitiesData = Array.isArray(activitiesResponse.data)
            ? activitiesResponse.data
            : [];
          setActivities(activitiesData);
        } catch {
          setActivities([]);
        }
      } catch {
        setError("No se pudieron cargar los datos del itinerario.");
        toast.error("❌ Error al cargar el itinerario");
      } finally {
        setLoading(false);
      }
    };

    loadItineraryData();
  }, [tripId]);

  // Funciones auxiliares para formatear fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Agrupar actividades por día
  const groupActivitiesByDay = () => {
    const grouped: { [key: string]: Activity[] } = {};

    // Verificar que activities sea un array válido
    if (!Array.isArray(activities)) {
      return grouped;
    }

    activities.forEach((activity) => {
      const date = formatDate(activity.start_date);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(activity);
    });

    // Ordenar actividades dentro de cada día por hora de inicio
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
    });

    return grouped;
  };

  const activitiesByDay = groupActivitiesByDay();

  // Función para resetear el formulario
  const resetActivityForm = () => {
    setActivityFormData({
      name: "",
      description: "",
      start_datetime: "",
      end_datetime: "",
      location: "",
      itinerary_id: itinerary?.id || 0,
    });
    setShowActivityForm(false);
  };

  const handleCreateActivity = () => {
    // Establecer el itinerary_id cuando se abre el formulario
    if (itinerary?.id) {
      setActivityFormData((prev) => ({
        ...prev,
        itinerary_id: itinerary.id,
      }));
    }
    setShowActivityForm(true);
  };

  // Función para crear la actividad
  const createActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;

    setIsSubmitting(true);
    try {
      // Validar que las fechas estén dentro del rango del viaje
      if (trip?.start_date && trip?.end_date) {
        const startDate = new Date(activityFormData.start_datetime);
        const endDate = new Date(activityFormData.end_datetime);
        const tripStart = new Date(trip.start_date);
        const tripEnd = new Date(trip.end_date);

        // Ajustar las fechas del viaje para comparación
        tripStart.setHours(0, 0, 0, 0);
        tripEnd.setHours(23, 59, 59, 999);

        if (startDate < tripStart || startDate > tripEnd) {
          toast.error(
            `La fecha de inicio debe estar entre ${tripStart.toLocaleDateString()} y ${tripEnd.toLocaleDateString()}`
          );
          setIsSubmitting(false);
          return;
        }

        if (endDate < tripStart || endDate > tripEnd) {
          toast.error(
            `La fecha de fin debe estar entre ${tripStart.toLocaleDateString()} y ${tripEnd.toLocaleDateString()}`
          );
          setIsSubmitting(false);
          return;
        }

        if (endDate <= startDate) {
          toast.error(
            "La fecha de fin debe ser posterior a la fecha de inicio"
          );
          setIsSubmitting(false);
          return;
        }
      }

      const token = localStorage.getItem("token");

      // Verificar que tenemos un itinerario
      if (!itinerary) {
        toast.error("No se puede crear la actividad sin un itinerario válido");
        setIsSubmitting(false);
        return;
      }

      // Procesar las fechas - convertir el datetime-local a formato ISO
      const startDate = activityFormData.start_datetime
        ? new Date(activityFormData.start_datetime).toISOString()
        : null;
      const endDate = activityFormData.end_datetime
        ? new Date(activityFormData.end_datetime).toISOString()
        : null;

      console.log("Enviando fechas al backend:", { startDate, endDate });

      // Crear la actividad
      const response = await axios.post(
        `http://localhost:3000/activities`,
        {
          trip_id: parseInt(tripId),
          itinerary_id: itinerary.id,
          name: activityFormData.name,
          description: activityFormData.description || null,
          start_date: startDate,
          end_date: endDate,
          location: activityFormData.location || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Extraer la actividad del response y actualizar el estado
      const newActivity = response.data.activity || response.data;
      setActivities((prev) => [...prev, newActivity]);

      // Resetear formulario y mostrar mensaje
      resetActivityForm();
      toast.success("Actividad creada exitosamente");
    } catch (error) {
      console.error("Error creating activity:", error);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Error al crear la actividad";
        toast.error(message);
      } else {
        toast.error("Error al crear la actividad");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para eliminar actividad
  const deleteActivity = async (activityId: number) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:3000/activities/${activityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Actualizar el estado local removiendo la actividad
      setActivities((prev) =>
        prev.filter((activity) => activity.id !== activityId)
      );
      toast.success("Actividad eliminada exitosamente");
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.error("Error al eliminar la actividad");
    }
  };

  const handleGenerateAI = async () => {
    if (!trip || !itinerary) {
      toast.error("Información del viaje no disponible");
      return;
    }

    // Función que llama al backend para generar el itinerario con IA
    const generateItineraryPromise = async (): Promise<{ activitiesCount: number }> => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("No hay token de autenticación");
        }

        // Llamada al backend para generar itinerario con IA
        const response = await axios.post(
          `http://localhost:3000/itineraries/${itinerary.id}/generate-ai`,
          {
            trip_id: parseInt(tripId!),
            trip_title: trip.title,
            destination: trip.destination || null,
            start_date: trip.start_date,
            end_date: trip.end_date,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // El backend devuelve las actividades ya creadas
        const newActivities = response.data.activities || [];
        
        if (!Array.isArray(newActivities)) {
          throw new Error("Respuesta inválida del servidor");
        }

        // Actualizar el estado con las nuevas actividades
        setActivities((prev) => [...prev, ...newActivities]);

        return { activitiesCount: newActivities.length };
      } catch (error) {
        console.error("Error en generación con IA:", error);
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || error.message;
          throw new Error(message);
        }
        throw error;
      }
    };

    // Usar toast.promise para manejar los estados automáticamente
    toast.promise(generateItineraryPromise(), {
      loading: "Generando itinerario con IA...",
      success: (data) => {
        console.log("✅ Itinerario generado con IA exitosamente");
        return `🎉 ¡Itinerario generado! Se crearon ${data.activitiesCount} actividades`;
      },
      error: (err) => {
        console.error("❌ Error generando itinerario con IA:", err);
        return `❌ Error al generar el itinerario: ${err.message}`;
      },
    });
  };

  if (loading)
    return <div className={styles.loading}>Cargando itinerario...</div>;

  // Verificar si el viaje tiene fechas definidas
  const hasValidDates = trip?.start_date && trip?.end_date;

  // Si showActivityForm es true, mostrar el formulario
  if (showActivityForm) {
    return (
      <div className={styles.formOverlay}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h3>Nueva Actividad</h3>
            <button
              type="button"
              className={styles.closeButton}
              onClick={resetActivityForm}
            >
              <X size={20} />
            </button>
          </div>
          <form className={styles.activityForm} onSubmit={createActivity}>
            <label>
              Nombre de la actividad:
              <input
                type="text"
                name="name"
                value={activityFormData.name}
                onChange={(e) =>
                  setActivityFormData({
                    ...activityFormData,
                    name: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Descripción:
              <textarea
                name="description"
                value={activityFormData.description}
                onChange={(e) =>
                  setActivityFormData({
                    ...activityFormData,
                    description: e.target.value,
                  })
                }
                placeholder="Describe los detalles de la actividad (opcional)"
              />
            </label>

            <label>
              Fecha y hora de inicio:
              <input
                type="datetime-local"
                name="start_datetime"
                value={activityFormData.start_datetime}
                onChange={(e) =>
                  setActivityFormData({
                    ...activityFormData,
                    start_datetime: e.target.value,
                  })
                }
                min={getDateLimits().min}
                max={getDateLimits().max}
                required
              />
              {trip?.start_date && trip?.end_date && (
                <small style={{ color: "#666", fontSize: "12px" }}>
                  Debe estar entre{" "}
                  {new Date(trip.start_date).toLocaleDateString()} y{" "}
                  {new Date(trip.end_date).toLocaleDateString()}
                </small>
              )}
            </label>

            <label>
              Fecha y hora de fin:
              <input
                type="datetime-local"
                name="end_datetime"
                value={activityFormData.end_datetime}
                onChange={(e) =>
                  setActivityFormData({
                    ...activityFormData,
                    end_datetime: e.target.value,
                  })
                }
                min={activityFormData.start_datetime || getDateLimits().min}
                max={getDateLimits().max}
                required
              />
              {activityFormData.start_datetime && (
                <small style={{ color: "#666", fontSize: "12px" }}>
                  Debe ser posterior a la fecha de inicio
                </small>
              )}
            </label>

            <label>
              Ubicación:
              <input
                type="text"
                name="location"
                value={activityFormData.location}
                onChange={(e) =>
                  setActivityFormData({
                    ...activityFormData,
                    location: e.target.value,
                  })
                }
                placeholder="Dirección o lugar de la actividad (opcional)"
              />
            </label>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={resetActivityForm}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creando..." : "Crear Actividad"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className={styles.title}>Itinerario</h2>
      <p className={styles.subtitle}>Organiza tu viaje por días y horas.</p>

      <div className={styles.actions}>
        <button
          className={styles.secondaryBtn}
          onClick={handleGenerateAI}
          disabled={!hasValidDates}
        >
          <Bot size={16} />
          Generar itinerario con IA
        </button>
        <button
          className={styles.primaryBtn}
          onClick={handleCreateActivity}
          disabled={!hasValidDates}
        >
          <Plus size={16} />
          Crear actividad
        </button>
      </div>

      {!hasValidDates && (
        <div className={styles.noActivities}>
          <p>
            <AlertTriangle
              size={18}
              style={{
                display: "inline",
                verticalAlign: "middle",
                marginRight: "8px",
                color: "#f59e0b",
              }}
            />
            Para crear el itinerario necesitas definir las fechas del viaje
            primero.
          </p>
          <p>
            Ve a la página de detalles del viaje para añadir las fechas de
            inicio y fin.
          </p>
        </div>
      )}

      {hasValidDates && error && <p className={styles.error}>{error}</p>}

      {hasValidDates && (!activities || activities.length === 0) && !error && (
        <div className={styles.noActivities}>
          <p>
            El itinerario está listo pero aún no hay actividades programadas.
          </p>
          <p>
            ¡Empieza creando tu primera actividad o genera un itinerario con IA!
          </p>
        </div>
      )}

      {Object.keys(activitiesByDay).map((date) => (
        <div key={date} className={styles.daySection}>
          <h3 className={styles.dayTitle}>
            <Calendar size={20} />
            {date}
          </h3>
          <div className={styles.dayActivities}>
            {activitiesByDay[date].map((activity) => (
              <div key={activity.id} className={styles.activityCard}>
                <div className={styles.activityHeader}>
                  <h4 className={styles.activityTitle}>{activity.name}</h4>
                  <Dialog.Root>
                    <Dialog.Trigger asChild>
                      <button
                        className={styles.deleteButton}
                        title="Eliminar actividad"
                      >
                        <Trash2 size={16} />
                      </button>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                      <Dialog.Overlay className={styles.dialogOverlay} />
                      <Dialog.Content className={styles.dialogContent}>
                        <Dialog.Title className={styles.dialogTitle}>
                          Eliminar actividad
                        </Dialog.Title>
                        <Dialog.Description
                          className={styles.dialogDescription}
                        >
                          ¿Estás seguro de que quieres eliminar "{activity.name}
                          "? Esta acción no se puede deshacer.
                        </Dialog.Description>
                        <div className={styles.dialogActions}>
                          <Dialog.Close asChild>
                            <button className={styles.cancelButton}>
                              Cancelar
                            </button>
                          </Dialog.Close>
                          <Dialog.Close asChild>
                            <button
                              className={styles.deleteConfirmButton}
                              onClick={() => deleteActivity(activity.id)}
                            >
                              Eliminar
                            </button>
                          </Dialog.Close>
                        </div>
                      </Dialog.Content>
                    </Dialog.Portal>
                  </Dialog.Root>
                </div>
                <div className={styles.activityInfo}>
                  <span className={styles.activityTime}>
                    <Clock size={16} />
                    {formatTime(activity.start_date)} -{" "}
                    {formatTime(activity.end_date)}
                  </span>
                  {activity.location && (
                    <span className={styles.activityLocation}>
                      <MapPin size={16} />
                      {activity.location}
                    </span>
                  )}
                </div>
                {activity.description && (
                  <p className={styles.activityDescription}>
                    {activity.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
