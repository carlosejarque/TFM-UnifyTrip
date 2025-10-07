import { useState } from "react";
import { X, Loader2, LogIn } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import styles from "./JoinTripModal.module.css";

interface JoinTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function JoinTripModal({ isOpen, onClose, onSuccess }: JoinTripModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinTrip = async () => {
    if (!code || code.length !== 6) {
      toast.error("Por favor, ingresa un código de 6 dígitos");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Primero buscar la invitación por código
      const findResponse = await axios.get(
        `http://localhost:3000/invitations/find-by-code/${code}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const invitationToken = findResponse.data.token;

      // Luego aceptar la invitación usando el token
      const response = await axios.post(
        `http://localhost:3000/invitations/join/${invitationToken}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("¡Te has unido al viaje exitosamente!");
      onSuccess();
      onClose();
      setCode("");
      
      // Navegar al viaje
      if (response.data.trip?.id) {
        navigate(`/trips/${response.data.trip.id}`);
      }
    } catch (error) {
      console.error("Error uniéndose al viaje:", error);
      const message = axios.isAxiosError(error) 
        ? error.response?.data?.message || "Error al unirse al viaje"
        : "Error al unirse al viaje";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleJoinTrip();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <LogIn size={24} className={styles.headerIcon} />
            <div>
              <h2 className={styles.modalTitle}>Unirse a un viaje</h2>
              <p className={styles.modalSubtitle}>
                Ingresa el código de 6 dígitos
              </p>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.inputSection}>
            <label className={styles.label}>Código de invitación</label>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              onKeyPress={handleKeyPress}
              placeholder="123456"
              className={styles.codeInput}
              maxLength={6}
              autoFocus
              disabled={loading}
            />
            <p className={styles.hint}>
              Pide al organizador del viaje que te comparta el código
            </p>
          </div>

          <button
            onClick={handleJoinTrip}
            className={styles.joinButton}
            disabled={loading || code.length !== 6}
          >
            {loading ? (
              <>
                <Loader2 size={18} className={styles.spinning} />
                Uniéndose...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Unirse al viaje
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
