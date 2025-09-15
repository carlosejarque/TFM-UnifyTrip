import styles from "./TripCard.module.css";
import { Link } from "react-router-dom";

type TripCardProps = {
  title: string;
  dates: string;
  image: string;
  to: string;
};

export function TripCard({ title, dates, image, to }: TripCardProps) {
  return (
    <Link to={to} className={styles.link}>
      <div className={styles.card}>
        <div className={styles.cardInfo}>
          <p className={styles.cardTitle}>{title}</p>
          <p className={styles.cardDates}>{dates}</p>
        </div>
        <div
          className={styles.cardImg}
          style={{ backgroundImage: `url(${image})` }}
        />
      </div>
    </Link>
  );
}
