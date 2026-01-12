import { Link } from 'react-router-dom'
import * as Tooltip from '@radix-ui/react-tooltip'
import { 
  MapPin, 
  Users, 
  Calendar, 
  DollarSign, 
  Vote, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Globe,
  Clock
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import styles from './HomePage.module.css'

export const HomePage = () => {
  const { isAuthenticated } = useAuth()

  return (
    <Tooltip.Provider>
      <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Planifica viajes <span className={styles.highlight}>increíbles</span> con tus amigos
            </h1>
            <p className={styles.heroDescription}>
              UnifyTrip es la plataforma definitiva para organizar viajes en grupo. 
              Coordina itinerarios, gestiona gastos y toma decisiones colaborativas 
              de forma sencilla y divertida.
            </p>
            <div className={styles.heroActions}>
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className={styles.primaryBtn}>
                    <Sparkles size={20} />
                    Comenzar gratis
                  </Link>
                  <Link to="/login" className={styles.secondaryBtn}>
                    Iniciar sesión
                    <ArrowRight size={18} />
                  </Link>
                </>
              ) : (
                <Link to="/newtrip" className={styles.primaryBtn}>
                  <MapPin size={20} />
                  Crear nuevo viaje
                </Link>
              )}
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroCard}>
              <MapPin className={styles.heroIcon} />
              <h3>Viaje a Barcelona</h3>
              <p>5 participantes • 7 días</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Todo lo que necesitas para organizar el viaje perfecto</h2>
            <p>Herramientas intuitivas que simplifican la planificación grupal</p>
          </div>
          
          <div className={styles.featuresGrid}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <Calendar size={24} />
                  </div>
                  <h3>Itinerarios colaborativos</h3>
                  <p>Crea y edita itinerarios en tiempo real con todos los participantes del viaje.</p>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className={styles.tooltipContent} sideOffset={5}>
                  Sincronización en tiempo real, notificaciones automáticas y edición colaborativa
                  <Tooltip.Arrow className={styles.tooltipArrow} />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <DollarSign size={24} />
                  </div>
                  <h3>Gestión de gastos</h3>
                  <p>Registra gastos compartidos y calcula automáticamente quién debe a quién.</p>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className={styles.tooltipContent} sideOffset={5}>
                  Cálculos automáticos, múltiples monedas y reportes detallados
                  <Tooltip.Arrow className={styles.tooltipArrow} />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <Vote size={24} />
                  </div>
                  <h3>Votaciones grupales</h3>
                  <p>Toma decisiones democráticas sobre destinos, actividades y planes del viaje.</p>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className={styles.tooltipContent} sideOffset={5}>
                  Sistema de votación anónima, deadlines personalizables y resultados en tiempo real
                  <Tooltip.Arrow className={styles.tooltipArrow} />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Users size={24} />
              </div>
              <h3>Colaboración sencilla</h3>
              <p>Invita amigos, comparte información y mantén a todos sincronizados.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Globe size={24} />
              </div>
              <h3>Destinos ilimitados</h3>
              <p>Explora cualquier lugar del mundo con nuestro sistema de búsqueda avanzado.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Clock size={24} />
              </div>
              <h3>Ahorra tiempo</h3>
              <p>Automatiza tareas repetitivas y enfócate en disfrutar la experiencia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Así de fácil es organizar tu próximo viaje</h2>
            <p>En solo unos pasos tendrás todo listo para una experiencia inolvidable</p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Crea tu viaje</h3>
                <p>Define destino, fechas y agrega a tus compañeros de aventura.</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Planifica juntos</h3>
                <p>Colabora en itinerarios, vota actividades y organiza los detalles.</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Gestiona gastos</h3>
                <p>Registra gastos compartidos y mantén las finanzas claras.</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>¡Disfruta el viaje!</h3>
                <p>Todo está organizado, solo queda vivir la experiencia.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>¿Listo para tu próxima aventura?</h2>
            <p>Únete a miles de viajeros que ya confían en UnifyTrip</p>
            <div className={styles.ctaActions}>
              {!isAuthenticated ? (
                <Link to="/register" className={styles.ctaBtn}>
                  <Sparkles size={20} />
                  Empezar ahora - Es gratis
                </Link>
              ) : (
                <Link to="/newtrip" className={styles.ctaBtn}>
                  <MapPin size={20} />
                  Planificar nuevo viaje
                </Link>
              )}
            </div>
            
            <div className={styles.benefits}>
              <div className={styles.benefit}>
                <CheckCircle size={16} />
                <span>Gratis para siempre</span>
              </div>
              <div className={styles.benefit}>
                <CheckCircle size={16} />
                <span>Sin límite de viajes</span>
              </div>
              <div className={styles.benefit}>
                <CheckCircle size={16} />
                <span>Soporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </Tooltip.Provider>
  )
}
