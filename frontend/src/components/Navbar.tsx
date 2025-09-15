import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import logo from "../assets/logo.png";
import { useAuth } from "../hooks/useAuth";
import { LogOut, X } from "lucide-react";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Sesión cerrada correctamente");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <Link to="/" className={styles.link}>
          <img src={logo} alt="Logo UnifyTrip" />
        </Link>
      </div>

      <div className={styles.links}>
        <Link to="/about" className={styles.link}>
          Conócenos
        </Link>
        <Link to="/features" className={styles.link}>
          Funcionalidades
        </Link>
        <Link to="/faq" className={styles.link}>
          Preguntas frecuentes
        </Link>
        <Link to="/mytrips" className={styles.link}>
          Mis viajes
        </Link>
        {!isAuthenticated ? (
          <Link to="/login">
            <button className={styles.loginBtn}>Iniciar sesión</button>
          </Link>
        ) : (
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button 
                className={styles.logoutBtn}
                title="Cerrar sesión"
              >
                <LogOut size={20} />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className={styles.dialogOverlay} />
              <Dialog.Content className={styles.dialogContent}>
                <Dialog.Title className={styles.dialogTitle}>
                  Cerrar sesión
                </Dialog.Title>
                
                <div className={styles.dialogBody}>
                  <p>¿Estás seguro de que quieres cerrar sesión?</p>
                </div>

                <div className={styles.dialogActions}>
                  <Dialog.Close asChild>
                    <button 
                      type="button" 
                      className={styles.dialogCancelButton}
                    >
                      Cancelar
                    </button>
                  </Dialog.Close>
                  <button 
                    type="button"
                    className={styles.dialogConfirmButton}
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </div>

                <Dialog.Close asChild>
                  <button className={styles.dialogCloseButton} aria-label="Cerrar">
                    <X size={20} />
                  </button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </div>
    </nav>
  );
};