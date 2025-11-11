import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./TripPollPage.module.css";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuth } from "../hooks/useAuth";

type PollType = "text" | "single-date" | "date-range";

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

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface OptionData {
  type: 'text' | 'single-date' | 'date-range';
  text?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}

export function TripPollPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollOptions, setPollOptions] = useState<PollOption[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [pollToDelete, setPollToDelete] = useState<{id: number; title: string} | null>(null);

  const formatDate = (dateString: string, isRange: boolean = false) => {
    const date = new Date(dateString);
    const formatOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    
    const formatted = date.toLocaleDateString('es-ES', formatOptions);
    return isRange ? formatted : `📅 ${formatted}`;
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startFormatted = formatDate(startDate, true);
    const endFormatted = formatDate(endDate, true);
    
    if (start.getFullYear() === end.getFullYear()) {
      const startSameYear = start.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
      
      if (start.getMonth() === end.getMonth()) {
        const monthYear = end.toLocaleDateString('es-ES', {
          month: 'short',
          year: 'numeric'
        });
        return `� ${start.getDate()}-${end.getDate()} ${monthYear}`;
      }
      
      return `� ${startSameYear} - ${endFormatted}`;
    }
    
    return `� ${startFormatted} - ${endFormatted}`;
  };

  const getUserDisplayName = (userId: number): string => {
    const user = users.find(u => u.id === userId);
    if (!user) return 'Usuario desconocido';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    return user.username;
  };
  
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

  const addOption = () => {
    if (formData.type === 'single-date') {
      setNewOptions([...newOptions, { type: 'single-date', date: '' }]);
    } else if (formData.type === 'date-range') {
      setNewOptions([...newOptions, { type: 'date-range', startDate: '', endDate: '' }]);
    } else {
      setNewOptions([...newOptions, { type: 'text', text: '' }]);
    }
  };

  const removeOption = (index: number) => {
    if (newOptions.length > 2) {
      setNewOptions(newOptions.filter((_, i) => i !== index));
    }
  };

  const updateTextOption = (index: number, value: string) => {
    const updated = [...newOptions];
    updated[index] = { ...updated[index], text: value };
    setNewOptions(updated);
  };

  const updateSingleDateOption = (index: number, value: string) => {
    const updated = [...newOptions];
    updated[index] = { ...updated[index], date: value };
    setNewOptions(updated);
  };

  const updateDateOption = (index: number, field: 'start' | 'end', value: string) => {
    const updated = [...newOptions];
    if (field === 'start') {
      updated[index] = { ...updated[index], startDate: value };
    } else {
      updated[index] = { ...updated[index], endDate: value };
    }
    setNewOptions(updated);
  };

  const handleTypeChange = (newType: PollType) => {
    setFormData({...formData, type: newType});
    
    if (newType === 'single-date') {
      setNewOptions([
        { type: 'single-date', date: '' },
        { type: 'single-date', date: '' }
      ]);
    } else if (newType === 'date-range') {
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'text',
      is_multiple: false
    });
    setNewOptions([
      { type: 'text', text: '' },
      { type: 'text', text: '' }
    ]);
    setShowForm(false);
    setEditingPoll(null);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let pollsData: Poll[] = [];
      try {
        const pollsRes = await axios.get<Poll[]>(
          `http://localhost:3000/polls/trip/${tripId}`
        );
        pollsData = pollsRes.data ?? [];
      } catch (pollsError) {
        if (axios.isAxiosError(pollsError) && pollsError.response?.status === 404) {
          pollsData = [];
        } else {
          throw pollsError;
        }
      }

      setPolls(Array.isArray(pollsData) ? pollsData : []);

      if (!pollsData.length) {
        setPollOptions([]);
        setVotes([]);
        return;
      }

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

      const allOptions: PollOption[] = optionsResults.flatMap((r) =>
        r.status === "fulfilled" ? r.value.data ?? [] : []
      );
      const allVotes: Vote[] = votesResults.flatMap((r) =>
        r.status === "fulfilled" ? r.value.data ?? [] : []
      );

      setPollOptions(allOptions);
      setVotes(allVotes);
      
      const userIds = [...new Set(allVotes.map(vote => vote.user_id))];
      if (userIds.length > 0) {
        try {
          const token = localStorage.getItem("token");
          const userPromises = userIds.map(userId =>
            axios.get<User>(`http://localhost:3000/users/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          );
          
          const userResults = await Promise.allSettled(userPromises);
          const usersData: User[] = [];
          userResults.forEach(result => {
            if (result.status === 'fulfilled') {
              usersData.push(result.value.data);
            }
          });
          
          setUsers(usersData);
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }
    } catch {
      setError("No se pudieron cargar las encuestas.");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    } catch {
      toast.error("No se pudo registrar el voto. Inténtalo de nuevo.");
    }
  }

  const createPoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let validOptions;
      if (formData.type === 'single-date') {
        validOptions = newOptions.filter(opt => opt.date && opt.date.trim() !== '');
        if (validOptions.length < 2) {
          toast.error('Debes agregar al menos 2 fechas válidas');
          return;
        }
      } else if (formData.type === 'date-range') {
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
      const pollId = newPoll.poll?.id || newPoll.id;
      
      const optionPromises = validOptions.map(option => {
        let optionData;
        if (formData.type === 'single-date') {
          optionData = {
            poll_id: pollId,
            label: null,
            start_date: option.date,
            end_date: null
          };
        } else if (formData.type === 'date-range') {
          optionData = {
            poll_id: pollId,
            label: null,
            start_date: option.startDate,
            end_date: option.endDate
          };
        } else {
          optionData = {
            poll_id: pollId,
            label: option.text,
            start_date: null,
            end_date: null
          };
        }
                
        return axios.post('http://localhost:3000/poll-options', optionData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      });

      await Promise.all(optionPromises);
      
      resetForm();
      toast.success('Encuesta creada exitosamente');
      
      await fetchData();
      
    } catch (error) {
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

  const deletePoll = async (pollId: number) => {
    try {
      const token = localStorage.getItem('token');
      
      // Intentar eliminar votos individualmente primero
      try {
        const votesResponse = await axios.get(`http://localhost:3000/votes/poll/${pollId}`);
        const votes = votesResponse.data || [];
        
        // Eliminar cada voto por su ID individual
        for (const vote of votes) {
          try {
            await axios.delete(`http://localhost:3000/votes/${vote.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (voteError) {
            console.warn(`No se pudo eliminar voto ${vote.id}:`, voteError);
          }
        }
      } catch (votesError) {
        console.warn('No se pudieron eliminar los votos:', votesError);
        // Continuamos sin votos, la DB debería manejar la integridad referencial
      }
      
      // Eliminar opciones de la encuesta (este endpoint sí existe)
      await axios.delete(`http://localhost:3000/poll-options/poll/${pollId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Eliminar la encuesta
      await axios.delete(`http://localhost:3000/polls/${pollId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Encuesta eliminada exitosamente');
      
      await fetchData();
    } catch (error) {
      console.error('Error deleting poll:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Error al eliminar la encuesta';
        toast.error(message);
      } else {
        toast.error('Error al eliminar la encuesta');
      }
    } finally {
      setPollToDelete(null);
    }
  };

  const startEditPoll = (poll: Poll) => {
    const options = pollOptions.filter(option => option.poll_id === poll.id);
    
    setEditingPoll(poll);
    setFormData({
      title: poll.title,
      description: poll.description || '',
      type: poll.type,
      is_multiple: poll.is_multiple
    });
    
    if (poll.type === 'single-date') {
      setNewOptions(options.map(option => ({
        type: 'single-date' as const,
        date: option.start_date || ''
      })));
    } else if (poll.type === 'date-range') {
      setNewOptions(options.map(option => ({
        type: 'date-range' as const,
        startDate: option.start_date || '',
        endDate: option.end_date || ''
      })));
    } else {
      setNewOptions(options.map(option => ({
        type: 'text' as const,
        text: option.label || ''
      })));
    }
    
    setShowForm(true);
  };

  const updatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPoll) return;
    
    setIsSubmitting(true);
    
    try {
      let validOptions: OptionData[];
      if (formData.type === 'single-date') {
        validOptions = newOptions.filter((opt: OptionData) => opt.date && opt.date.trim() !== '');
        if (validOptions.length < 2) {
          toast.error('Debes agregar al menos 2 fechas válidas');
          return;
        }
      } else if (formData.type === 'date-range') {
        validOptions = newOptions.filter((opt: OptionData) => 
          opt.startDate && opt.endDate && opt.startDate <= opt.endDate
        );
        if (validOptions.length < 2) {
          toast.error('Debes agregar al menos 2 rangos de fechas válidos');
          return;
        }
      } else {
        validOptions = newOptions.filter((opt: OptionData) => opt.text?.trim() !== '');
        if (validOptions.length < 2) {
          toast.error('Debes agregar al menos 2 opciones');
          return;
        }
      }

      const token = localStorage.getItem('token');
      

      await axios.put(`http://localhost:3000/polls/${editingPoll.id}`, {
        trip_id: parseInt(tripId!),
        title: formData.title,
        description: formData.description || null,
        type: formData.type,
        is_multiple: formData.is_multiple
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });


      const existingOptions = pollOptions.filter(option => option.poll_id === editingPoll.id);
      const shouldReplaceOptions = formData.type !== editingPoll.type || 
        existingOptions.length !== validOptions.length;



      if (shouldReplaceOptions) {
        await axios.delete(`http://localhost:3000/votes/poll/${editingPoll.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        await axios.delete(`http://localhost:3000/poll-options/poll/${editingPoll.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });


        const optionPromises = validOptions.map((option: OptionData) => {
          let optionData;
          if (formData.type === 'single-date') {
            optionData = {
              poll_id: editingPoll.id,
              label: null,
              start_date: option.date,
              end_date: null
            };
          } else if (formData.type === 'date-range') {
            optionData = {
              poll_id: editingPoll.id,
              label: null,
              start_date: option.startDate,
              end_date: option.endDate
            };
          } else {
            optionData = {
              poll_id: editingPoll.id,
              label: option.text,
              start_date: null,
              end_date: null
            };
          }
                  
          return axios.post('http://localhost:3000/poll-options', optionData, {
            headers: { Authorization: `Bearer ${token}` }
          });
        });

        await Promise.all(optionPromises);
        
        setVotes(prev => prev.filter(vote => vote.poll_id !== editingPoll.id));
        
        toast.warning('Tipo de encuesta cambiado - los votos existentes se han eliminado');
      } else {
        const updatePromises = validOptions.map((option: OptionData, index: number) => {
          const existingOption = existingOptions[index];
          if (existingOption) {
            let optionData;
            if (formData.type === 'single-date') {
              optionData = {
                poll_id: editingPoll.id,
                label: null,
                start_date: option.date,
                end_date: null
              };
            } else if (formData.type === 'date-range') {
              optionData = {
                poll_id: editingPoll.id,
                label: null,
                start_date: option.startDate,
                end_date: option.endDate
              };
            } else {
              optionData = {
                poll_id: editingPoll.id,
                label: option.text,
                start_date: null,
                end_date: null
              };
            }
            
            return axios.put(`http://localhost:3000/poll-options/${existingOption.id}`, optionData, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } else {
            let optionData;
            if (formData.type === 'single-date') {
              optionData = {
                poll_id: editingPoll.id,
                label: null,
                start_date: option.date,
                end_date: null
              };
            } else if (formData.type === 'date-range') {
              optionData = {
                poll_id: editingPoll.id,
                label: null,
                start_date: option.startDate,
                end_date: option.endDate
              };
            } else {
              optionData = {
                poll_id: editingPoll.id,
                label: option.text,
                start_date: null,
                end_date: null
              };
            }
            
            return axios.post('http://localhost:3000/poll-options', optionData, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }
        });

        await Promise.all(updatePromises);
        if (existingOptions.length > validOptions.length) {
          const optionsToDelete = existingOptions.slice(validOptions.length);
          await Promise.all(optionsToDelete.map(option => 
            axios.delete(`http://localhost:3000/poll-options/${option.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          ));
        }
      }
      
      resetForm();
      setEditingPoll(null);
      
      if (shouldReplaceOptions) {
        toast.success('Encuesta actualizada - tipo cambiado, votos eliminados');
      } else {
        toast.success('Encuesta actualizada - votos preservados');
      }
      
      await fetchData();
      
    } catch (error) {
      console.error('Error updating poll:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Error al actualizar la encuesta';
        toast.error(message);
      } else {
        toast.error('Error al actualizar la encuesta');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  if (showForm) {
    return (
      <div className={styles.formOverlay}>
        <div className={styles.formContainer}>
          <h3>{editingPoll ? 'Editar Encuesta' : 'Nueva Encuesta'}</h3>
          <form className={styles.pollForm} onSubmit={editingPoll ? updatePoll : createPoll}>
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
                <option value="text">📝 Texto</option>
                <option value="single-date">📅 Fechas Individuales</option>
                <option value="date-range">📆 Períodos de Fechas</option>
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
            

            <div className={styles.optionsSection}>
              <h4>Opciones de la encuesta:</h4>
              {formData.type === 'single-date' ? (
                newOptions.map((option, index) => (
                  <div key={index} className={styles.optionInput}>
                    <input
                      type="date"
                      placeholder={`Fecha ${index + 1}`}
                      value={option.date || ''}
                      onChange={(e) => updateSingleDateOption(index, e.target.value)}
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
              ) : formData.type === 'date-range' ? (
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
                {isSubmitting ? (editingPoll ? 'Actualizando...' : 'Creando...') : (editingPoll ? 'Actualizar' : 'Crear')}
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
            <div className={styles.pollHeader}>
              <div className={styles.pollTitleSection}>
                <h3 className={styles.pollTitle}>{poll.title}</h3>
                {poll.description && (
                  <p className={styles.pollDescription}>{poll.description}</p>
                )}
              </div>
              <div className={styles.pollActions}>
                <button
                  className={styles.editButton}
                  title="Editar encuesta"
                  onClick={() => startEditPoll(poll)}
                >
                  <Edit size={16} />
                </button>
                <button
                  className={styles.deleteButton}
                  title="Eliminar encuesta"
                  onClick={() => setPollToDelete({id: poll.id, title: poll.title})}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className={styles.pollOptions}>
              {(() => {
                const totalVotes = pollVotes.length;
                
                return (
                  <>
                    {totalVotes === 0 && (
                      <div className={styles.noVotesMessage}>
                        <span>🗳️ ¡Sé el primero en votar!</span>
                      </div>
                    )}
                    {options.map((option) => {
                      const optionVotes = pollVotes.filter(
                        (vote) => vote.poll_option_id === option.id
                      );
                      const voteCount = optionVotes.length;
                      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                      const isWinning = voteCount > 0 && voteCount === Math.max(...options.map(opt => 
                        pollVotes.filter(v => v.poll_option_id === opt.id).length
                      ));
                      const currentUserHasVoted = user && optionVotes.some(vote => vote.user_id === user.id);

                      return (
                        <div
                          key={option.id}
                          className={`${styles.pollOption} ${isWinning ? styles.winningOption : ''} ${currentUserHasVoted ? styles.userVotedOption : ''}`}
                          onClick={() => {voteOption(poll, option.id)}}
                        >
                          <div className={styles.optionContent}>
                            <span className={styles.optionLabel}>
                              {currentUserHasVoted && <span className={styles.userVoteIndicator}>✓</span>}
                              {isWinning && <span className={styles.winnerCrown}>👑</span>}
                              {option.label ||
                                (option.start_date && option.end_date
                                  ? formatDateRange(option.start_date, option.end_date)
                                  : option.start_date && !option.end_date
                                  ? formatDate(option.start_date)
                                  : "Opción sin título")}
                            </span>
                            <div className={styles.voteStats}>
                              <span className={styles.voteCount}>
                                {voteCount} {voteCount === 1 ? 'voto' : 'votos'}
                              </span>
                              {totalVotes > 0 && (
                                <span className={styles.votePercentage}>
                                  {percentage}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={styles.progressBar}>
                            <div 
                              className={styles.progressFill} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          {voteCount > 0 && (
                            <div className={styles.votersList}>
                              <span className={styles.votersLabel}>
                                👥 {voteCount === 1 ? 'Votado por:' : `${voteCount} votos de:`}
                              </span>
                              <div className={styles.votersContainer}>
                                {optionVotes.map((vote) => {
                                  const isCurrentUser = user && vote.user_id === user.id;
                                  return (
                                    <span 
                                      key={vote.id} 
                                      className={`${styles.voterChip} ${isCurrentUser ? styles.currentUserChip : ''}`}
                                    >
                                      {isCurrentUser && '👤 '}
                                      {getUserDisplayName(vote.user_id)}
                                      {isCurrentUser && ' (Tú)'}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </div>
        );
      })}
      
      <Dialog.Root
        open={!!pollToDelete}
        onOpenChange={(open) => !open && setPollToDelete(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogOverlay} />
          <Dialog.Content className={styles.dialogContent}>
            <Dialog.Title className={styles.dialogTitle}>
              🗑️ Eliminar Encuesta
            </Dialog.Title>

            <div className={styles.dialogBody}>
              <p>
                ¿Estás seguro de que quieres eliminar la encuesta{" "}
                <strong>"{pollToDelete?.title}"</strong>?
              </p>
              <p className={styles.dialogWarning}>
                Esta acción eliminará la encuesta, todas sus opciones y votos. No se puede deshacer.
              </p>
            </div>

            <div className={styles.dialogActions}>
              <Dialog.Close asChild>
                <button type="button" className={styles.dialogCancelButton}>
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="button"
                className={styles.dialogDeleteButton}
                onClick={() => pollToDelete && deletePoll(pollToDelete.id)}
              >
                Eliminar
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
