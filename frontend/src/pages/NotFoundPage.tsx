import { useNavigate } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.textContent}>
          <h1 className={styles.title}>¡Oops! Página no encontrada</h1>
          <p className={styles.description}>
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          <p className={styles.subdescription}>
            ¿Te perdiste en tu viaje? No te preocupes, te ayudamos a encontrar el camino de vuelta.
          </p>
          
          <div className={styles.actions}>
            <button 
              onClick={handleGoHome}
              className={styles.primaryButton}
            >
              🏠 Ir al Inicio
            </button>
            <button 
              onClick={handleGoBack}
              className={styles.secondaryButton}
            >
              ← Volver Atrás
            </button>
          </div>
        </div>
      </div>
      
      <div className={styles.footer}>
        <p>Error 404 - UnifyTrip</p>
      </div>
    </div>
  );
}