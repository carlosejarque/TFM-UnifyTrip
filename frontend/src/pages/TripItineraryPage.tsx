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
  Edit,
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
  generatedByAI?: boolean;
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
  const [users, setUsers] = useState<{[key: number]: string}>({});
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const fetchUserName = async (userId: number): Promise<string> => {
    if (!userId || userId === null || userId === undefined) {
      return 'Usuario desconocido';
    }

    if (users[userId]) {
      return users[userId];
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:3000/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const username = response.data.username;
      setUsers(prev => ({ ...prev, [userId]: username }));
      return username;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return 'Usuario desconocido';
    }
  };

  const ActivityCreatorLabel = ({ activity }: { activity: Activity }) => {
    const [creatorText, setCreatorText] = useState<string>('');

    useEffect(() => {
      const loadCreator = async () => {
        if (activity.generatedByAI) {
          setCreatorText('🤖 IA');
        } else {
          const username = await fetchUserName(activity.created_by);
          setCreatorText(`👤 ${username}`);
        }
      };
      loadCreator();
    }, [activity.created_by, activity.generatedByAI]);

    if (!creatorText) return null;

    return (
      <span 
        className={activity.generatedByAI ? styles.aiCreatorLabel : styles.userCreatorLabel}
        title={activity.generatedByAI ? 'Generado por Inteligencia Artificial' : `Creado por ${creatorText.replace('👤 ', '')}`}
      >
        {creatorText}
      </span>
    );
  };

  const getDateLimits = () => {
    if (!trip?.start_date || !trip?.end_date) {
      return { min: "", max: "" };
    }

    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);

    const minDateTime = new Date(startDate);
    minDateTime.setHours(0, 0, 0, 0);

    const maxDateTime = new Date(endDate);
    maxDateTime.setHours(23, 59, 59, 999);

    return {
      min: minDateTime.toISOString().slice(0, 16),
      max: maxDateTime.toISOString().slice(0, 16),
    };
  };

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

        const tripResponse = await axios.get(
          `http://localhost:3000/trips/${tripId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const tripData = tripResponse.data;
        setTrip(tripData);

        if (!tripData.start_date || !tripData.end_date) {
          setError(
            "Define las fechas del viaje primero para ver el itinerario. Ve a la página de detalles del viaje."
          );
          setLoading(false);
          return;
        }

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

  const groupActivitiesByDay = () => {
    const grouped: { [key: string]: Activity[] } = {};

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

    Object.keys(grouped).forEach((date) => {
      grouped[date].sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
    });

    return grouped;
  };

  const activitiesByDay = groupActivitiesByDay();

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
    if (itinerary?.id) {
      setActivityFormData((prev) => ({
        ...prev,
        itinerary_id: itinerary.id,
      }));
    }
    setShowActivityForm(true);
  };

  const createActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;

    setIsSubmitting(true);
    try {
      // Validación: la hora de fin no puede ser menor que la hora de inicio
      if (activityFormData.start_datetime && activityFormData.end_datetime) {
        if (activityFormData.end_datetime <= activityFormData.start_datetime) {
          toast.error("La fecha y hora de fin debe ser posterior a la de inicio");
          setIsSubmitting(false);
          return;
        }
      }

      if (trip?.start_date && trip?.end_date) {
        const startDate = new Date(activityFormData.start_datetime);
        const endDate = new Date(activityFormData.end_datetime);
        const tripStart = new Date(trip.start_date);
        const tripEnd = new Date(trip.end_date);

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

      if (!itinerary) {
        toast.error("No se puede crear la actividad sin un itinerario válido");
        setIsSubmitting(false);
        return;
      }

      const startDate = activityFormData.start_datetime
        ? activityFormData.start_datetime + ":00"
        : null;
      const endDate = activityFormData.end_datetime
        ? activityFormData.end_datetime + ":00"
        : null;

      await axios.post(
        `http://localhost:3000/activities`,
        {
          trip_id: parseInt(tripId),
          itinerary_id: itinerary.id,
          name: activityFormData.name,
          description: activityFormData.description || null,
          start_date: startDate,
          end_date: endDate,
          location: activityFormData.location || null,
          generatedByAI: false,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await reloadActivities();

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

  const deleteActivity = async (activityId: number) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:3000/activities/${activityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await reloadActivities();
      toast.success("Actividad eliminada exitosamente");
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.error("Error al eliminar la actividad");
    }
  };

  const startEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
  };

  const cancelEdit = () => {
    setEditingActivity(null);
  };

  const getLocalDateFromISO = (isoString: string): string => {
    return isoString.split('T')[0];
  };

  const getLocalTimeFromISO = (isoString: string): string => {
    return isoString.split('T')[1]?.slice(0, 5) || "";
  };

  const updateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;

    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const token = localStorage.getItem("token");
      
      const date = formData.get("date") as string;
      const startTime = formData.get("start_time") as string;
      const endTime = formData.get("end_time") as string;

      // Validación: la hora de fin no puede ser menor que la hora de inicio
      if (startTime && endTime && endTime < startTime) {
        toast.error("La hora de fin no puede ser anterior a la hora de inicio");
        setIsSubmitting(false);
        return;
      }

      const startDate = startTime 
        ? `${date}T${startTime}:00`
        : `${date}T00:00:00`;
      
      const endDate = endTime 
        ? `${date}T${endTime}:00`
        : `${date}T23:59:59`;

      const activityData = {
        trip_id: editingActivity.trip_id,
        itinerary_id: editingActivity.itinerary_id,
        name: formData.get("name"),
        description: formData.get("description"),
        location: formData.get("location"),
        start_date: startDate,
        end_date: endDate,
      };

      await axios.put(
        `http://localhost:3000/activities/${editingActivity.id}`,
        activityData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await reloadActivities();
      toast.success("Actividad actualizada exitosamente");
      setEditingActivity(null);
    } catch (error) {
      console.error("Error updating activity:", error);
      toast.error("Error al actualizar la actividad");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reloadActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !itinerary?.id) return;

      const activitiesResponse = await axios.get(
        `http://localhost:3000/activities/itinerary/${itinerary.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const activitiesData = Array.isArray(activitiesResponse.data)
        ? activitiesResponse.data
        : [];
      setActivities(activitiesData);
    } catch (error) {
      console.error("Error recargando actividades:", error);
    }
  };

  const handleGenerateAI = async () => {
    if (!trip || !itinerary) {
      toast.error("Información del viaje no disponible");
      return;
    }

    const generateItineraryPromise = async (): Promise<{ activitiesCount: number }> => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("No hay token de autenticación");
        }

        const response = await axios.post(
          'http://localhost:3000/AI/generate-itinerary',
          {
            destination: trip.destination || null,
            startDate: trip.start_date,
            endDate: trip.end_date,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log('AI Itinerary Response:', response.data);

        if (!response.data.success) {
          throw new Error(response.data.error || "Error generando itinerario");
        }

        const aiActivities = response.data.data.activities || [];
        
        if (!Array.isArray(aiActivities)) {
          throw new Error("Respuesta inválida del servidor");
        }

        const newActivities = await Promise.all(
          aiActivities.map(async (aiActivity) => {
            try {
              const activityResponse = await axios.post(
                'http://localhost:3000/activities',
                {
                  trip_id: parseInt(tripId!),
                  itinerary_id: itinerary?.id || 0,
                  name: aiActivity.name,
                  description: aiActivity.description,
                  start_date: aiActivity.startdate,
                  end_date: aiActivity.enddate,
                  location: aiActivity.location || null,
                  generatedByAI: true,
                },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              return activityResponse.data;
            } catch (error) {
              console.error('Error creando actividad:', error);
              return null;
            }
          })
        );

        const validActivities = newActivities.filter(activity => activity !== null);
        
        await reloadActivities();

        return { activitiesCount: validActivities.length };
      } catch (error) {
        console.error("Error en generación con IA:", error);
        if (axios.isAxiosError(error)) {
          const errorData = error.response?.data;
          if (errorData && !errorData.success) {
            throw new Error(errorData.error || "Error del servidor");
          }
          const message = errorData?.message || error.message;
          throw new Error(message);
        }
        throw error;
      }
    };

    toast.promise(generateItineraryPromise(), {
      loading: "Generando itinerario con IA...",
      success: (data) => {
        return `🎉 ¡Itinerario generado! Se crearon ${data.activitiesCount} actividades`;
      },
      error: (err) => {
        return `❌ Error al generar el itinerario: ${err.message}`;
      },
    });
  };

  if (loading)
    return <div className={styles.loading}>Cargando itinerario...</div>;

  const hasValidDates = trip?.start_date && trip?.end_date;

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
                  <div className={styles.activityTitleSection}>
                    <h4 className={styles.activityTitle}>{activity.name}</h4>
                    <ActivityCreatorLabel activity={activity} />
                  </div>
                  <div className={styles.activityActions}>
                    <button
                      className={styles.editButton}
                      title="Editar actividad"
                      onClick={() => startEditActivity(activity)}
                    >
                      <Edit size={16} />
                    </button>
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

      <Dialog.Root open={!!editingActivity} onOpenChange={(open) => !open && cancelEdit()}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogOverlay} />
          <Dialog.Content className={styles.dialogContent}>
            <Dialog.Title className={styles.dialogTitle}>
              Editar Actividad
            </Dialog.Title>
            <Dialog.Description className={styles.dialogDescription}>
              Modifica los campos de la actividad
            </Dialog.Description>
            
            {editingActivity && (
              <form onSubmit={updateActivity} className={styles.activityForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Nombre de la actividad *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={editingActivity.name}
                    required
                    className={styles.input}
                    placeholder="Ej: Visitar el museo"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description" className={styles.label}>
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={editingActivity.description || ""}
                    className={styles.textarea}
                    placeholder="Describe la actividad..."
                    rows={3}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="location" className={styles.label}>
                      Ubicación
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      defaultValue={editingActivity.location || ""}
                      className={styles.input}
                      placeholder="Dirección o lugar"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="date" className={styles.label}>
                      Fecha *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      defaultValue={getLocalDateFromISO(editingActivity.start_date)}
                      required
                      className={styles.input}
                      min={trip?.start_date || ""}
                      max={trip?.end_date || ""}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="start_time" className={styles.label}>
                      Hora de inicio
                    </label>
                    <input
                      type="time"
                      id="start_time"
                      name="start_time"
                      defaultValue={getLocalTimeFromISO(editingActivity.start_date)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="end_time" className={styles.label}>
                      Hora de fin
                    </label>
                    <input
                      type="time"
                      id="end_time"
                      name="end_time"
                      defaultValue={getLocalTimeFromISO(editingActivity.end_date)}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.dialogActions}>
                  <Dialog.Close asChild>
                    <button type="button" className={styles.cancelButton}>
                      Cancelar
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
