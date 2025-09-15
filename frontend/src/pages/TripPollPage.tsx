import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./TripPollPage.module.css";
import { toast } from "sonner";

type PollType = "destination" | "date" | "custom";

interface Poll {
  id: number;
  trip_id: number;
  title: string;
  description?: string | null;
  type: PollType;
  is_multiple: boolean;
}

interface PollOption {
  id: number;
  poll_id: number;
  label: string | null;
  start_date: string | null;
  end_date: string | null;
}

interface Vote {
  id: number;
  poll_id: number;
  poll_option_id: number;
  user_id: number;
  value: number;
}

interface OptionData {
  type: 'text' | 'date-range';
  text?: string;
  startDate?: string;
  endDate?: string;
}

export function TripPollPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollOptions, setPollOptions] = useState<PollOption[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para formatear fechas de manera más visual
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    
    const startFormatted = start.toLocaleDateString('es-ES', formatOptions);
    const endFormatted = end.toLocaleDateString('es-ES', formatOptions);
    
    // Si es el mismo año, no repetir el año en la fecha de inicio
    if (start.getFullYear() === end.getFullYear()) {
      const startSameYear = start.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
      
      // Si es el mismo mes y año, mostrar solo el rango de días
      if (start.getMonth() === end.getMonth()) {
        const monthYear = end.toLocaleDateString('es-ES', {
          month: 'short',
          year: 'numeric'
        });
        return `📅 ${start.getDate()}-${end.getDate()} ${monthYear}`;
      }
      
      return `📅 ${startSameYear} - ${endFormatted}`;
    }
    
    return `📅 ${startFormatted} - ${endFormatted}`;
  };
  
  // Estados para el formulario de nueva encuesta
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'custom' as PollType,
    is_multiple: false
  });
  const [newOptions, setNewOptions] = useState<OptionData[]>([
    { type: 'text', text: '' },
    { type: 'text', text: '' }
  ]);

  // Función para agregar una nueva opción
  const addOption = () => {
    if (formData.type === 'date') {
      setNewOptions([...newOptions, { type: 'date-range', startDate: '', endDate: '' }]);
    } else {
      setNewOptions([...newOptions, { type: 'text', text: '' }]);
    }
  };

  // Función para eliminar una opción
  const removeOption = (index: number) => {
    if (newOptions.length > 2) {
      setNewOptions(newOptions.filter((_, i) => i !== index));
    }
  };

  // Función para actualizar una opción de texto
  const updateTextOption = (index: number, value: string) => {
    const updated = [...newOptions];
    updated[index] = { ...updated[index], text: value };
    setNewOptions(updated);
  };

  // Función para actualizar una opción de fecha
  const updateDateOption = (index: number, field: 'start' | 'end', value: string) => {
    const updated = [...newOptions];
    if (field === 'start') {
      updated[index] = { ...updated[index], startDate: value };
    } else {
      updated[index] = { ...updated[index], endDate: value };
    }
    setNewOptions(updated);
  };

  // Función para manejar el cambio de tipo de encuesta
  const handleTypeChange = (newType: PollType) => {
    setFormData({...formData, type: newType});
    
    // Resetear opciones según el tipo
    if (newType === 'date') {
      setNewOptions([
        { type: 'date-range', startDate: '', endDate: '' },
        { type: 'date-range', startDate: '', endDate: '' }
      ]);
    } else {
      setNewOptions([
        { type: 'text', text: '' },
        { type: 'text', text: '' }
      ]);
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'custom',
      is_multiple: false
    });
    setNewOptions([
      { type: 'text', text: '' },
      { type: 'text', text: '' }
    ]);
    setShowForm(false);
  };

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Obtener encuestas del viaje
        let pollsData: Poll[] = [];
        try {
          const pollsRes = await axios.get<Poll[]>(
            `http://localhost:3000/polls/trip/${tripId}`
          );
          pollsData = pollsRes.data ?? [];
        } catch (pollsError) {
          if (axios.isAxiosError(pollsError) && pollsError.response?.status === 404) {
            // No hay encuestas para este viaje, es normal
            pollsData = [];
          } else {
            throw pollsError; // Re-lanzar otros errores
          }
        }
        
        if (cancelled) return;

        setPolls(Array.isArray(pollsData) ? pollsData : []);

        if (!pollsData.length) {
          setPollOptions([]);
          setVotes([]);
          return;
        }

        // 2. Crear arrays de promesas
        const optionsPromises = pollsData.map((poll) =>
          axios.get<PollOption[]>(
            `http://localhost:3000/poll-options/poll/${poll.id}`
          )
        );

        const votesPromises = pollsData.map((poll) =>
          axios
            .get<Vote[]>(`http://localhost:3000/votes/poll/${poll.id}`)
            .catch((err) => {
              if (err?.response?.status === 404) {
                return { data: [] as Vote[] };
              }
              throw err;
            })
        );

        const [optionsResults, votesResults] = await Promise.all([
          Promise.allSettled(optionsPromises),
          Promise.allSettled(votesPromises),
        ]);
        if (cancelled) return;

        const allOptions: PollOption[] = optionsResults.flatMap((r) =>
          r.status === "fulfilled" ? r.value.data ?? [] : []
        );
        const allVotes: Vote[] = votesResults.flatMap((r) =>
          r.status === "fulfilled" ? r.value.data ?? [] : []
        );

        if (!cancelled) {
          setPollOptions(allOptions);
          setVotes(allVotes);
        }
      } catch (err) {
        if (!cancelled) {
          setError("No se pudieron cargar las encuestas.");
          console.error("Error fetching polls/options/votes:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  async function voteOption(poll: Poll, optionId: number) {
    try {
      
      await axios.post("http://localhost:3000/votes", {
        poll_id: poll.id,
        poll_option_id: optionId,
        value: 1,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      let newVotes: Vote[] = [];
      try {
        const { data } = await axios.get<Vote[]>(
          `http://localhost:3000/votes/poll/${poll.id}`
        );
        newVotes = data ?? [];
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err?.response?.status !== 404) throw err;
        newVotes = [];
      }
      
      setVotes((prev) => {
        const others = prev.filter((v) => v.poll_id !== poll.id);
        return [...others, ...newVotes];
      });

      toast.success("Voto registrado con éxito");
    } catch (e) {
      console.error("Error voting:", e);
      toast.error("No se pudo registrar el voto. Inténtalo de nuevo.");
    }
  }

  // Función para crear la encuesta en la base de datos
  const createPoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validaciones
      let validOptions;
      if (formData.type === 'date') {
        validOptions = newOptions.filter(opt => 
          opt.startDate && opt.endDate && opt.startDate <= opt.endDate
        );
        if (validOptions.length < 2) {
          toast.error('Debes agregar al menos 2 rangos de fechas válidos');
          return;
        }
      } else {
        validOptions = newOptions.filter(opt => opt.text?.trim() !== '');
        if (validOptions.length < 2) {
          toast.error('Debes agregar al menos 2 opciones');
          return;
        }
      }

      // 1. Crear la encuesta principal
      const pollResponse = await axios.post('http://localhost:3000/polls', {
        trip_id: parseInt(tripId!),
        title: formData.title,
        description: formData.description || null,
        type: formData.type,
        is_multiple: formData.is_multiple
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const newPoll = pollResponse.data;
      // 2. Crear las opciones de la encuesta
      const pollId = newPoll.poll?.id || newPoll.id; // Acceder al ID dentro del objeto poll
      
      const optionPromises = validOptions.map(option => {
        const optionData = formData.type === 'date' ? {
          poll_id: pollId,
          label: null,
          start_date: option.startDate,
          end_date: option.endDate
        } : {
          poll_id: pollId,
          label: option.text,
          start_date: null,
          end_date: null
        };
                
        return axios.post('http://localhost:3000/poll-options', optionData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      });

      await Promise.all(optionPromises);

      // 3. Actualizar el estado local
      const pollToAdd = newPoll.poll || newPoll; // Usar el objeto poll real
      setPolls(prev => [...prev, pollToAdd]);
      
      // 4. Resetear formulario y mostrar mensaje
      resetForm();
      toast.success('Encuesta creada exitosamente');
      
    } catch (error) {
      console.error('Error creating poll:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Error al crear la encuesta';
        toast.error(message);
      } else {
        toast.error('Error al crear la encuesta');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  // Si showForm es true, solo mostrar el formulario
  if (showForm) {
    return (
      <div className={styles.formOverlay}>
        <div className={styles.formContainer}>
          <h3>Nueva Encuesta</h3>
          <form className={styles.pollForm} onSubmit={createPoll}>
            <label>
              Título:
              <input 
                type="text" 
                name="title" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required 
              />
            </label>
            <label>
              Descripción:
              <textarea 
                name="description" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </label>
            <label>
              Tipo:
              <select 
                name="type" 
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value as PollType)}
                required
              >
                <option value="destination">Destino</option>
                <option value="date">Fechas</option>
                <option value="custom">Personalizado</option>
              </select>
            </label>
            <label>
              Permitir múltiples votos:
              <input 
                type="checkbox" 
                name="is_multiple" 
                checked={formData.is_multiple}
                onChange={(e) => setFormData({...formData, is_multiple: e.target.checked})}
              />
            </label>
            
            {/* Sección de opciones */}
            <div className={styles.optionsSection}>
              <h4>Opciones de la encuesta:</h4>
              {formData.type === 'date' ? (
                // Opciones para encuestas de fechas
                newOptions.map((option, index) => (
                  <div key={index} className={styles.optionInput}>
                    <div className={styles.dateInputs}>
                      <input
                        type="date"
                        placeholder="Fecha inicio"
                        value={option.startDate || ''}
                        onChange={(e) => updateDateOption(index, 'start', e.target.value)}
                        required
                      />
                      <input
                        type="date"
                        placeholder="Fecha fin"
                        value={option.endDate || ''}
                        onChange={(e) => updateDateOption(index, 'end', e.target.value)}
                        required
                      />
                    </div>
                    {newOptions.length > 2 && (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeOption(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))
              ) : (
                // Opciones para encuestas de texto
                newOptions.map((option, index) => (
                  <div key={index} className={styles.optionInput}>
                    <input
                      type="text"
                      placeholder={`Opción ${index + 1}`}
                      value={option.text || ''}
                      onChange={(e) => updateTextOption(index, e.target.value)}
                      required
                    />
                    {newOptions.length > 2 && (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeOption(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))
              )}
              <button
                type="button"
                className={styles.addOptionBtn}
                onClick={addOption}
              >
                + Agregar opción
              </button>
            </div>
            <div className={styles.formActions}>
              <button 
                type="submit" 
                className={styles.primaryBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creando...' : 'Crear'}
              </button>
              <button 
                type="button" 
                className={styles.secondaryBtn} 
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className={styles.title}>Encuestas</h2>
      <p className={styles.subtitle}>
        Participa en las encuestas activas de este viaje.
      </p>

      <div className={styles.actions}>
        <button className={styles.primaryBtn} onClick={() =>{ setShowForm(true)}}>
          Crear encuesta
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {(!polls || polls.length === 0) && !error && (
        <p className={styles.noPolls}>No hay encuestas disponibles.</p>
      )}

      {Array.isArray(polls) && polls.map((poll) => {
        const options = pollOptions.filter(
          (option) => option.poll_id === poll.id
        );
        const pollVotes = votes.filter((vote) => vote.poll_id === poll.id);

        return (
          <div key={poll.id} className={styles.pollCard}>
            <h3 className={styles.pollTitle}>{poll.title}</h3>
            {poll.description && (
              <p className={styles.pollDescription}>{poll.description}</p>
            )}
            <div className={styles.pollOptions}>
              {options.map((option) => {
                const optionVotes = pollVotes.filter(
                  (vote) => vote.poll_option_id === option.id
                );
                const voteCount = optionVotes.length;

                return (
                  <div
                    key={option.id}
                    className={styles.pollOption}
                    onClick={() => {voteOption(poll, option.id)}}
                  >
                    <span className={styles.optionLabel}>
                      {option.label ||
                        (option.start_date && option.end_date
                          ? formatDateRange(option.start_date, option.end_date)
                          : "Opción sin título")}
                    </span>
                    <span className={styles.voteCount}>
                      ({voteCount} votos)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
