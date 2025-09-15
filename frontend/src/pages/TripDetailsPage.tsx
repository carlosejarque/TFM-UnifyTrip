import { NavLink, Outlet, useParams } from "react-router-dom";
import styles from "./TripDetailsPage.module.css";
import { BadgeEuro, House, Map, Vote } from "lucide-react";

export function TripDetailsPage() {
  const { id } = useParams();

  return (
    <div className={styles.pageWrapper}>
      <aside className={styles.sidebar}>
        <nav>
          <ul>
            <li>
              <NavLink
                to={`/trips/${id}`}
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
                to={`/trips/${id}/polls`}
                className={({ isActive }) =>
                  [styles.menuLink, isActive ? styles.active : ""].join(" ")
                }
              >
                <Vote size={22}/>
                <span>Encuestas</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`/trips/${id}/itinerary`}
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
                to={`/trips/${id}/budget`}
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
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
