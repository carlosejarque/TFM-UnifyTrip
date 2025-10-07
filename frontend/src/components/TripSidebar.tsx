import { NavLink } from "react-router-dom";
import { BadgeEuro, House, Map, Vote, ArrowLeft, Users } from "lucide-react";
import styles from "./TripSidebar.module.css";

interface TripSidebarProps {
  tripId: string;
}

export function TripSidebar({ tripId }: TripSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <nav>
        <ul>
          <li>
            <NavLink
              to="/mytrips"
              className={styles.navigationBackLink}
            >
              <ArrowLeft size={18} />
              <span>Mis Viajes</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/trips/${tripId}`}
              end
              className={({ isActive }) =>
                [styles.menuLink, isActive ? styles.active : ""].join(" ")
              }
            >
              <House size={22} />
              <span>Resumen</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/trips/${tripId}/polls`}
              className={({ isActive }) =>
                [styles.menuLink, isActive ? styles.active : ""].join(" ")
              }
            >
              <Vote size={22} />
              <span>Encuestas</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/trips/${tripId}/itinerary`}
              className={({ isActive }) =>
                [styles.menuLink, isActive ? styles.active : ""].join(" ")
              }
            >
              <Map size={22} />
              <span>Itinerario</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/trips/${tripId}/participants`}
              className={({ isActive }) =>
                [styles.menuLink, isActive ? styles.active : ""].join(" ")
              }
            >
              <Users size={22} />
              <span>Participantes</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/trips/${tripId}/budget`}
              className={({ isActive }) =>
                [styles.menuLink, isActive ? styles.active : ""].join(" ")
              }
            >
              <BadgeEuro size={22} />
              <span>Presupuesto</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}