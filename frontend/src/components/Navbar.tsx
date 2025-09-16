import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import logo from "../assets/logo.png";
import { useAuth } from "../hooks/useAuth";
import * as Avatar from "@radix-ui/react-avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { User, LogOut, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Sesión cerrada correctamente");
    setShowLogoutDialog(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleProfileClick = () => {
    // Navegar a la página de perfil (asumo que existe o se creará)
    navigate("/profile");
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
          Acerca de
        </Link>
        <Link to="/help" className={styles.link}>
          Ayuda
        </Link>
        <Link to="/mytrips" className={styles.link}>
          Mis viajes
        </Link>
        {!isAuthenticated ? (
          <Link to="/login">
            <button className={styles.loginBtn}>Iniciar sesión</button>
          </Link>
        ) : (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className={styles.avatarButton}>
                <Avatar.Root className={styles.avatar}>
                  <Avatar.Fallback className={styles.avatarFallback}>
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </Avatar.Fallback>
                </Avatar.Root>
              </button>
            </DropdownMenu.Trigger>
            
            <DropdownMenu.Portal>
              <DropdownMenu.Content className={styles.dropdownContent}>
                <DropdownMenu.Item 
                  className={styles.dropdownItem}
                  onClick={handleProfileClick}
                >
                  <User size={16} />
                  Perfil
                </DropdownMenu.Item>
                
                <DropdownMenu.Separator className={styles.dropdownSeparator} />
                
                <DropdownMenu.Item 
                  className={`${styles.dropdownItem} ${styles.danger}`}
                  onClick={handleLogoutClick}
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>

      {/* Dialog de confirmación para cerrar sesión */}
      <Dialog.Root open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
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
    </nav>
  );
};