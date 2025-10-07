import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DateRange } from "react-date-range";
import { es } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import styles from "./NewTripPage.module.css";
import axios from "axios";
import { toast } from "sonner";

type NewTripForm = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  destination: string;
  imageUrl: string;
};

const TOTAL_STEPS = 4;

export function NewTripPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<NewTripForm>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    destination: "",
    imageUrl: "",
  });

  const [range, setRange] = useState<
    { startDate: Date | undefined; endDate: Date | undefined; key: string }[]
  >([
    {
      startDate: undefined,
      endDate: undefined,
      key: "selection",
    },
  ]);

  const handleNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleChange = (field: keyof NewTripForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const step1Valid = form.title;

  // Función helper para convertir Date a string en formato YYYY-MM-DD en zona horaria local
  const formatDateToLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleNextFromDates = () => {
    setForm((prev) => ({
      ...prev,
      startDate: range[0].startDate
        ? formatDateToLocal(range[0].startDate)
        : "",
      endDate: range[0].endDate
        ? formatDateToLocal(range[0].endDate)
        : "",
    }));
    handleNext();
  };

  const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

  const handleNextFromStep3 = async () => {
    if (!form.destination) {
      setForm((prev) => ({
        ...prev,
        imageUrl:
          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      }));
      handleNext();
      return;
    }

    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?client_id=${UNSPLASH_ACCESS_KEY}&query=${encodeURIComponent(
          form.destination
        )}&orientation=landscape&per_page=1`
      );
      const data = await response.json();
      const url =
        data.results && data.results.length > 0
          ? data.results[0].urls.regular
          : "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";

      setForm((prev) => ({
        ...prev,
        imageUrl: url,
      }));
      handleNext();
    } catch (error) {
      setForm((prev) => ({
        ...prev,
        imageUrl:
          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80", // fallback
      }));
      console.error("Error fetching image from Unsplash:", error);
      handleNext();
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Crear nuevo viaje</h2>
        <div className={styles.stepper}>
          Paso {step} de {TOTAL_STEPS}
        </div>

        {/* Paso 1: Nombre y descripción */}
        {step === 1 && (
          <div className={styles.step}>
            <div className={styles.stepHeader}>
              <h3 className={styles.stepTitle}>Información básica</h3>
              <p className={styles.stepSubtitle}>
                Comencemos con los detalles fundamentales de tu viaje
              </p>
            </div>
            
            <label>
              Nombre del viaje
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Ej: Aventura en París"
                required
              />
            </label>
            
            <label>
              Descripción
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe el viaje, actividades previstas, experiencias que esperas vivir..."
                rows={4}
                required
              />
            </label>
            
            <div className={styles.stepButtons}>
              <button
                className={styles.nextBtn}
                onClick={handleNext}
                disabled={!step1Valid}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Paso 2: Fechas (DateRangePicker) */}
        {step === 2 && (
          <div className={styles.step}>
            <div className={styles.stepHeader}>
              <h3 className={styles.stepTitle}>¿Cuándo viajarás?</h3>
              <p className={styles.stepSubtitle}>
                Selecciona las fechas de tu viaje. Si aún no estás seguro, puedes omitir este paso
              </p>
            </div>
            
            <div className={styles.datePickerContainer}>
              <DateRange
                editableDateInputs={true}
                onChange={(ranges) => {
                  const selection = ranges.selection;
                  setRange([
                    {
                      startDate: selection.startDate ?? undefined,
                      endDate: selection.endDate ?? undefined,
                      key: selection.key || "selection",
                    },
                  ]);
                }}
                moveRangeOnFirstSelection={false}
                ranges={range}
                months={2}
                direction="horizontal"
                showMonthAndYearPickers={true}
                minDate={new Date()}
                locale={es}
              />
            </div>
            
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() =>
                setRange([
                  {
                    startDate: undefined,
                    endDate: undefined,
                    key: "selection",
                  },
                ])
              }
            >
              Limpiar fechas
            </button>
            
            <div className={styles.stepButtons}>
              <button className={styles.backBtn} onClick={handleBack}>
                Atrás
              </button>
              <button
                className={styles.nextBtn}
                onClick={handleNextFromDates}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Destino */}
        {step === 3 && (
          <div className={styles.step}>
            <div className={styles.stepHeader}>
              <h3 className={styles.stepTitle}>¿Cuál es tu destino?</h3>
              <p className={styles.stepSubtitle}>
                Dinos a dónde planeas viajar para personalizar tu experiencia
              </p>
            </div>
            
            <label>
              Destino
              <input
                type="text"
                value={form.destination}
                onChange={(e) => handleChange("destination", e.target.value)}
                placeholder="Ej: París, Francia"
                required
              />
            </label>
            
            <div className={styles.stepButtons}>
              <button className={styles.backBtn} onClick={handleBack}>
                Atrás
              </button>
              <button className={styles.nextBtn} onClick={handleNextFromStep3}>
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Paso 4: Resumen */}
        {step === 4 && (
          <div className={styles.step}>
            <h3 className={styles.summaryTitle}>¡Casi listo! Revisa tu viaje</h3>
            
            <div className={styles.summaryBox}>
              <img
                src={form.imageUrl}
                alt={form.destination}
                className={styles.summaryImg}
              />
              <div className={styles.summaryInfo}>
                <div className={styles.summaryName}>{form.title}</div>
                <div className={styles.summaryDescription}>
                  {form.description}
                </div>
                {(form.startDate && form.endDate) && (
                  <div className={styles.summaryDates}>
                    📅 {form.startDate} – {form.endDate}
                  </div>
                )}
                {form.destination && (
                  <div className={styles.summaryDestination}>
                    📍 {form.destination}
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.stepButtons}>
              <button className={styles.backBtn} onClick={handleBack}>
                Atrás
              </button>
              <button
                className={styles.nextBtn}
                onClick={async () => {
                  try {
                    const toNull = (v?: string | null) =>
                      v && v.trim() !== "" ? v.trim() : null;
                    const token = localStorage.getItem("token");
                    
                    const tripResponse = await axios.post(
                      "http://localhost:3000/trips",
                      {
                        title: form.title, 
                        description: toNull(form.description), 
                        destination: toNull(form.destination), 
                        start_date:
                          form.startDate && form.startDate !== ""
                            ? form.startDate
                            : null,
                        end_date:
                          form.endDate && form.endDate !== ""
                            ? form.endDate
                            : null,
                        image_url: toNull(form.imageUrl),
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    const tripId = tripResponse.data.id || tripResponse.data.trip?.id;
                    
                    if (tripId) {
                      await axios.post(
                        "http://localhost:3000/itineraries",
                        {
                          trip_id: tripId,
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );
                    }

                    if (tripId) {
                      await axios.post(
                        `http://localhost:3000/trip-participants`,
                        { 
                          trip_id: tripId 
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );
                    }

                    toast.success("¡Viaje creado correctamente! Redirigiendo a los detalles...");
                    
                    // Redireccionar a la página de detalles del viaje después de 2 segundos
                    setTimeout(() => {
                      navigate(`/trips/${tripId}`);
                    }, 2000);
                  } catch (error) {
                    toast.error(
                      "Error al crear el viaje. Por favor, inténtalo de nuevo más tarde."
                    );
                    console.error("Error creating trip:", error);
                  }
                }}
              >
                ✨ Crear Viaje
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
