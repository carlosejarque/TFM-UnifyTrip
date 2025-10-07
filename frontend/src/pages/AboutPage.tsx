import styles from "./AboutPage.module.css";
import * as Tooltip from "@radix-ui/react-tooltip";
import { 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  BarChart3,
  CheckCircle,
  Globe,
  Heart,
  Star,
  Info
} from "lucide-react";

export function AboutPage() {
  const features = [
    {
      icon: <Users size={32} />,
      title: "Gestión de Participantes",
      description: "Invita amigos, familiares o compañeros de trabajo a tu viaje de forma sencilla."
    },
    {
      icon: <Calendar size={32} />,
      title: "Planificación de Itinerarios",
      description: "Organiza actividades, horarios y destinos con una interfaz intuitiva."
    },
    {
      icon: <DollarSign size={32} />,
      title: "Control de Presupuesto",
      description: "Divide gastos equitativamente y mantén un seguimiento transparente de todas las finanzas."
    },
    {
      icon: <MessageSquare size={32} />,
      title: "Sistema de Votaciones",
      description: "Toma decisiones grupales de manera democrática con nuestro sistema de polls."
    },
    {
      icon: <BarChart3 size={32} />,
      title: "Estadísticas del Viaje",
      description: "Visualiza gastos por categorías y obtén insights útiles de tu viaje."
    },
    {
      icon: <MapPin size={32} />,
      title: "Geolocalización",
      description: "Encuentra lugares cercanos y planifica rutas optimizadas para tu grupo."
    }
  ];

  const benefits = [
    "Elimina la confusión en gastos compartidos",
    "Reduce el tiempo de planificación grupal",
    "Mejora la comunicación entre participantes",
    "Centraliza toda la información del viaje",
    "Facilita la toma de decisiones grupales"
  ];

  return (
    <Tooltip.Provider>
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Planifica viajes grupales <span className={styles.highlight}>sin complicaciones</span>
            </h1>
            <p className={styles.heroDescription}>
              UnifyTrip es la plataforma definitiva para organizar viajes en grupo. 
              Gestiona participantes, presupuestos, itinerarios y toma decisiones 
              de manera colaborativa, todo en un solo lugar.
            </p>
            <div className={styles.heroStats}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div className={styles.stat}>
                    <Globe className={styles.statIcon} />
                    <span className={styles.statNumber}>100+</span>
                    <span className={styles.statLabel}>Viajes organizados</span>
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className={styles.tooltipContent} sideOffset={5}>
                    Viajes exitosamente planificados y completados por nuestros usuarios
                    <Tooltip.Arrow className={styles.tooltipArrow} />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>

              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div className={styles.stat}>
                    <Heart className={styles.statIcon} />
                    <span className={styles.statNumber}>500+</span>
                    <span className={styles.statLabel}>Usuarios satisfechos</span>
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className={styles.tooltipContent} sideOffset={5}>
                    Usuarios activos que han usado nuestra plataforma para organizar sus viajes
                    <Tooltip.Arrow className={styles.tooltipArrow} />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>

              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div className={styles.stat}>
                    <Star className={styles.statIcon} />
                    <span className={styles.statNumber}>4.9</span>
                    <span className={styles.statLabel}>Valoración promedio</span>
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className={styles.tooltipContent} sideOffset={5}>
                    Puntuación media basada en las reseñas de nuestros usuarios
                    <Tooltip.Arrow className={styles.tooltipArrow} />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </div>
          </div>
        </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Funcionalidades principales</h2>
          <p className={styles.sectionDescription}>
            Todo lo que necesitas para organizar el viaje perfecto
          </p>
        </div>
        
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                {feature.icon}
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefits}>
        <div className={styles.benefitsContent}>
          <div className={styles.benefitsText}>
            <h2 className={styles.sectionTitle}>¿Por qué elegir UnifyTrip?</h2>
            <p className={styles.sectionDescription}>
              Simplificamos la organización de viajes grupales para que puedas 
              enfocarte en lo que realmente importa: disfrutar la experiencia.
            </p>
            <ul className={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <li key={index} className={styles.benefitItem}>
                  <CheckCircle size={20} className={styles.checkIcon} />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.benefitsImage}>
            <div className={styles.imagePlaceholder}>
              <Users size={120} className={styles.placeholderIcon} />
              <p>Imagen del equipo o viajeros</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.team}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Nuestro compromiso</h2>
          <p className={styles.sectionDescription}>
            En UnifyTrip creemos que viajar en grupo debería ser una experiencia 
            emocionante, no estresante. Por eso hemos creado una plataforma que 
            elimina las fricciones comunes en la organización de viajes grupales.
          </p>
        </div>
        
        <div className={styles.missionCards}>
          <div className={styles.missionCard}>
            <h3>🎯 Nuestra Misión</h3>
            <p>
              Hacer que la planificación de viajes grupales sea tan emocionante 
              como el viaje mismo, eliminando el estrés y maximizando la diversión.
            </p>
          </div>
          <div className={styles.missionCard}>
            <h3>👁️ Nuestra Visión</h3>
            <p>
              Ser la plataforma líder mundial para la organización de viajes 
              grupales, conectando personas y creando experiencias inolvidables.
            </p>
          </div>
          <div className={styles.missionCard}>
            <h3>💝 Nuestros Valores</h3>
            <p>
              Transparencia en gastos, colaboración en decisiones y simplicidad 
              en cada paso del proceso de planificación.
            </p>
          </div>
        </div>
      </section>
    </div>
    </Tooltip.Provider>
  );
}