import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Lock, Mail, Save, ArrowLeft } from "lucide-react";
import styles from "./ProfilePage.module.css";

export const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  
  const [username, setUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoadingUsername, setIsLoadingUsername] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("El nombre de usuario no puede estar vacío");
      return;
    }
    
    if (username === user?.username) {
      toast.info("El nombre de usuario no ha cambiado");
      setIsEditingUsername(false);
      return;
    }

    setIsLoadingUsername(true);
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:3000/api/users/update-username", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar el nombre de usuario");
      }

      toast.success("Nombre de usuario actualizado correctamente");
      setIsEditingUsername(false);
      
      // Actualizar el usuario en el contexto
      const updatedUser = { ...user, username };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.location.reload(); // Recargar para actualizar el contexto
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar el nombre de usuario";
      toast.error(errorMessage);
      setUsername(user?.username || "");
    } finally {
      setIsLoadingUsername(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoadingPassword(true);
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:3000/api/users/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar la contraseña");
      }

      toast.success("Contraseña actualizada correctamente");
      setIsEditingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar la contraseña";
      toast.error(errorMessage);
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handleCancelUsername = () => {
    setUsername(user?.username || "");
    setIsEditingUsername(false);
  };

  const handleCancelPassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditingPassword(false);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Volver
        </button>

        <div className={styles.header}>
          <div className={styles.avatarLarge}>
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <h1 className={styles.title}>Mi Perfil</h1>
          <p className={styles.subtitle}>Gestiona tu información personal</p>
        </div>

        <div className={styles.content}>
          {/* Sección de Email (solo lectura) */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Mail className={styles.cardIcon} />
              <h2 className={styles.cardTitle}>Correo Electrónico</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.infoField}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className={styles.inputDisabled}
                />
                <p className={styles.helpText}>El correo electrónico no se puede modificar</p>
              </div>
            </div>
          </div>

          {/* Sección de Username */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <User className={styles.cardIcon} />
              <h2 className={styles.cardTitle}>Nombre de Usuario</h2>
            </div>
            <div className={styles.cardBody}>
              {!isEditingUsername ? (
                <div className={styles.infoField}>
                  <label className={styles.label}>Usuario</label>
                  <div className={styles.displayValue}>{user?.username}</div>
                  <button
                    className={styles.editButton}
                    onClick={() => setIsEditingUsername(true)}
                  >
                    Editar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateUsername} className={styles.form}>
                  <div className={styles.field}>
                    <label className={styles.label}>Nuevo nombre de usuario</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={styles.input}
                      placeholder="Ingresa tu nuevo username"
                      autoFocus
                    />
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={handleCancelUsername}
                      disabled={isLoadingUsername}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={styles.saveButton}
                      disabled={isLoadingUsername}
                    >
                      <Save size={18} />
                      {isLoadingUsername ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sección de Contraseña */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Lock className={styles.cardIcon} />
              <h2 className={styles.cardTitle}>Contraseña</h2>
            </div>
            <div className={styles.cardBody}>
              {!isEditingPassword ? (
                <div className={styles.infoField}>
                  <label className={styles.label}>Contraseña</label>
                  <div className={styles.displayValue}>••••••••</div>
                  <button
                    className={styles.editButton}
                    onClick={() => setIsEditingPassword(true)}
                  >
                    Cambiar contraseña
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className={styles.form}>
                  <div className={styles.field}>
                    <label className={styles.label}>Contraseña actual</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={styles.input}
                      placeholder="Ingresa tu contraseña actual"
                      autoFocus
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Nueva contraseña</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={styles.input}
                      placeholder="Ingresa tu nueva contraseña"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Confirmar contraseña</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={styles.input}
                      placeholder="Confirma tu nueva contraseña"
                    />
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={handleCancelPassword}
                      disabled={isLoadingPassword}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={styles.saveButton}
                      disabled={isLoadingPassword}
                    >
                      <Save size={18} />
                      {isLoadingPassword ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
