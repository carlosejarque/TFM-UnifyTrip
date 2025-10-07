import { Outlet, useParams } from "react-router-dom";
import styles from "./TripDetailsPage.module.css";
import { TripSidebar } from "../components/TripSidebar";

export function TripDetailsPage() {
  const { id } = useParams();

  if (!id) {
    return <div>Error: ID del viaje no encontrado</div>;
  }

  return (
    <div className={styles.pageWrapper}>
      <TripSidebar tripId={id} />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
