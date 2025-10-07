import { Heart, MapPin, Users, Calendar } from "lucide-react";
import styles from "./Footer.module.css";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Logo y descripción */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <MapPin className={styles.logoIcon} size={28} />
            <span className={styles.logoText}>UnifyTrip</span>
          </div>
          <p className={styles.brandDescription}>
            Planifica, organiza y vive aventuras increíbles con tus amigos.
            La plataforma que une a los viajeros.
          </p>
        </div>

        {/* Links principales */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Plataforma</h3>
          <ul className={styles.linksList}>
            <li><a href="/trips" className={styles.link}>Mis Viajes</a></li>
            <li><a href="/trips/new" className={styles.link}>Crear Viaje</a></li>
            <li><a href="/profile" className={styles.link}>Mi Perfil</a></li>
          </ul>
        </div>

        {/* Funcionalidades */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Funcionalidades</h3>
          <ul className={styles.linksList}>
            <li className={styles.feature}>
              <Users size={16} />
              <span>Invitaciones grupales</span>
            </li>
            <li className={styles.feature}>
              <Calendar size={16} />
              <span>Planificación colaborativa</span>
            </li>
            <li className={styles.feature}>
              <MapPin size={16} />
              <span>Recomendaciones IA</span>
            </li>
          </ul>
        </div>

        {/* Información legal */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Información</h3>
          <ul className={styles.linksList}>
            <li><a href="/privacy" className={styles.link}>Privacidad</a></li>
            <li><a href="/terms" className={styles.link}>Términos</a></li>
            <li><a href="/contact" className={styles.link}>Contacto</a></li>
            <li><a href="/help" className={styles.link}>Ayuda</a></li>
          </ul>
        </div>
      </div>

      {/* Línea divisoria y copyright */}
      <div className={styles.bottom}>
        <div className={styles.container}>
          <div className={styles.copyright}>
            <p>© {currentYear} UnifyTrip. Todos los derechos reservados.</p>
          </div>
          <div className={styles.madeWith}>
            <span>Hecho con</span>
            <Heart size={16} className={styles.heart} />
            <span>para los viajeros</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
