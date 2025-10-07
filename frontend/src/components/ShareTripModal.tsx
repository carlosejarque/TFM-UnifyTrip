import { useState, useEffect } from "react";
import { X, Link2, Copy, Check, RefreshCw, Share2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import styles from "./ShareTripModal.module.css";

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: number;
  tripTitle: string;
}

interface InviteLink {
  code: number;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export function ShareTripModal({
  isOpen,
  onClose,
  tripId,
  tripTitle,
}: ShareTripModalProps) {
  const [inviteLink, setInviteLink] = useState<InviteLink | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchInviteLink = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/invitations/trips/${tripId}/link`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInviteLink(response.data);
    } catch (error) {
      console.error("Error obteniendo enlace de invitación:", error);
      toast.error("Error al obtener el enlace de invitación");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInviteLink();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, tripId]);

  const generateNewLink = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:3000/invitations/trips/${tripId}/link`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInviteLink(response.data);
      toast.success("Nuevo enlace generado correctamente");
    } catch (error) {
      console.error("Error generando nuevo enlace:", error);
      toast.error("Error al generar nuevo enlace");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteLink) return;

    const fullLink = `${window.location.origin}/invitations/join/${inviteLink.token}`;
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      toast.success("Enlace copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copiando al portapapeles:", error);
      toast.error("Error al copiar el enlace");
    }
  };

  const shareViaWhatsApp = () => {
    if (!inviteLink) return;

    const fullLink = `${window.location.origin}/invitations/join/${inviteLink.token}`;
    const message = `¡Únete a mi viaje "${tripTitle}"! 🌍\n\n${fullLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const shareViaEmail = () => {
    if (!inviteLink) return;

    const fullLink = `${window.location.origin}/invitations/join/${inviteLink.token}`;
    const subject = `Invitación al viaje: ${tripTitle}`;
    const body = `¡Hola!\n\nTe invito a unirte a mi viaje "${tripTitle}" en UnifyTrip.\n\nHaz clic en el siguiente enlace para unirte:\n${fullLink}\n\nNota: Este enlace expira en 30 días.\n\n¡Nos vemos pronto!`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const getDaysUntilExpiration = () => {
    if (!inviteLink) return 0;

    const expirationDate = new Date(inviteLink.expiresAt);
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatExpirationDate = () => {
    if (!inviteLink) return "";

    const expirationDate = new Date(inviteLink.expiresAt);
    return expirationDate.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  const fullLink = inviteLink
    ? `${window.location.origin}/invitations/join/${inviteLink.token}`
    : "";
  const daysLeft = getDaysUntilExpiration();

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <Share2 size={24} className={styles.headerIcon} />
            <div>
              <h2 className={styles.modalTitle}>Compartir viaje</h2>
              <p className={styles.modalSubtitle}>{tripTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {loading && !inviteLink ? (
            <div className={styles.loadingState}>
              <RefreshCw size={32} className={styles.loadingSpinner} />
              <p>Generando enlace de invitación...</p>
            </div>
          ) : inviteLink ? (
            <>
              <div className={styles.codeSection}>
                <label className={styles.label}>Código único</label>
                <div className={styles.codeDisplay}>
                  <code className={styles.code}>{inviteLink.code}</code>
                </div>
              </div>

              <div className={styles.linkSection}>
                <label className={styles.label}>
                  <Link2 size={16} />
                  Enlace de invitación
                </label>
                <div className={styles.linkContainer}>
                  <input
                    type="text"
                    value={fullLink}
                    readOnly
                    className={styles.linkInput}
                  />
                  <button
                    onClick={copyToClipboard}
                    className={styles.copyButton}
                    title={copied ? "¡Copiado!" : "Copiar enlace"}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>

                <div className={styles.expirationInfo}>
                  <span className={styles.expirationLabel}>
                    {daysLeft > 0 ? (
                      <>
                        ⏰ Expira en <strong>{daysLeft} días</strong> ({formatExpirationDate()})
                      </>
                    ) : (
                      <>
                        ⚠️ <strong>Enlace expirado</strong>
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className={styles.actionsSection}>
                <h3 className={styles.sectionTitle}>Compartir por:</h3>
                <div className={styles.shareButtons}>
                  <button
                    onClick={shareViaWhatsApp}
                    className={styles.shareButton}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </button>
                  <button onClick={shareViaEmail} className={styles.shareButton}>
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="currentColor"
                    >
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                    Email
                  </button>
                </div>
              </div>

              <div className={styles.regenerateSection}>
                <button
                  onClick={generateNewLink}
                  className={styles.regenerateButton}
                  disabled={loading}
                >
                  <RefreshCw size={16} className={loading ? styles.spinning : ""} />
                  Generar nuevo enlace
                </button>
                <p className={styles.regenerateNote}>
                  Al generar un nuevo enlace, el anterior dejará de funcionar
                </p>
              </div>
            </>
          ) : (
            <div className={styles.errorState}>
              <p>No se pudo cargar el enlace de invitación</p>
              <button onClick={generateNewLink} className={styles.retryButton}>
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
