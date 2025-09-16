import styles from "./HelpPage.module.css";
import * as Accordion from "@radix-ui/react-accordion";
import { 
  ChevronDown, 
  MessageCircle, 
  Mail, 
  Phone,
  BookOpen,
  Users,
  DollarSign,
  Calendar,
  HelpCircle
} from "lucide-react";

export function HelpPage() {
  const faqs = [
    {
      category: "Primeros pasos",
      icon: <BookOpen size={24} />,
      questions: [
        {
          question: "¿Cómo creo mi primer viaje en UnifyTrip?",
          answer: "Para crear tu primer viaje, haz clic en 'Nuevo Viaje' desde la página principal. Completa los datos básicos como nombre del viaje, fechas, destino y descripción. Luego podrás invitar participantes y comenzar a planificar."
        },
        {
          question: "¿Necesito crear una cuenta para usar UnifyTrip?",
          answer: "Sí, necesitas crear una cuenta gratuita para poder crear viajes, unirte a grupos y acceder a todas las funcionalidades. El registro es rápido y solo requiere email, nombre de usuario y contraseña."
        },
        {
          question: "¿Es gratis usar UnifyTrip?",
          answer: "Sí, UnifyTrip es completamente gratuito. Puedes crear viajes ilimitados, invitar participantes sin límite y usar todas nuestras funcionalidades sin ningún costo."
        }
      ]
    },
    {
      category: "Gestión de participantes",
      icon: <Users size={24} />,
      questions: [
        {
          question: "¿Cómo invito participantes a mi viaje?",
          answer: "Desde la página de tu viaje, ve a la sección 'Participantes' y haz clic en 'Invitar participante'. Puedes enviar invitaciones por email o compartir el código del viaje para que se unan directamente."
        },
        {
          question: "¿Pueden los participantes ver toda la información del viaje?",
          answer: "Sí, todos los participantes pueden ver el itinerario, gastos, polls y demás información del viaje. Sin embargo, solo el creador del viaje y administradores pueden modificar información sensible."
        },
        {
          question: "¿Puedo quitar a alguien del viaje?",
          answer: "Como creador del viaje o administrador, puedes remover participantes desde la sección de gestión de participantes. Ten en cuenta que esto también eliminará sus gastos asociados."
        }
      ]
    },
    {
      category: "Gastos y presupuesto",
      icon: <DollarSign size={24} />,
      questions: [
        {
          question: "¿Cómo funciona la división de gastos?",
          answer: "Cuando añades un gasto, puedes seleccionar qué participantes deben dividirlo. El sistema calcula automáticamente la parte que corresponde a cada uno y mantiene un balance de quién debe dinero a quién."
        },
        {
          question: "¿Puedo añadir gastos en diferentes monedas?",
          answer: "Actualmente UnifyTrip trabaja principalmente en euros. Para gastos en otras monedas, recomendamos convertir el monto a euros al momento de añadir el gasto."
        },
        {
          question: "¿Cómo veo el balance de gastos del grupo?",
          answer: "En la sección 'Presupuesto' de tu viaje encontrarás un resumen completo de todos los gastos, balance por participante y sugerencias de liquidación para equilibrar las cuentas."
        }
      ]
    },
    {
      category: "Planificación e itinerarios",
      icon: <Calendar size={24} />,
      questions: [
        {
          question: "¿Puedo crear un itinerario detallado?",
          answer: "Sí, en la sección 'Itinerario' puedes añadir actividades por día, incluyendo horarios, ubicaciones, notas y enlaces. Todo el grupo puede ver y comentar sobre las actividades planificadas."
        },
        {
          question: "¿Cómo funcionan las votaciones (polls)?",
          answer: "Los polls te permiten tomar decisiones grupales. Puedes crear votaciones sobre destinos, actividades, restaurantes, etc. Todos los participantes pueden votar y ver los resultados en tiempo real."
        },
        {
          question: "¿Puedo modificar el itinerario después de crearlo?",
          answer: "Absolutamente. El itinerario es flexible y puede modificarse en cualquier momento. Los cambios se reflejan inmediatamente para todos los participantes del viaje."
        }
      ]
    }
  ];

  const quickStart = [
    {
      step: 1,
      title: "Crea tu cuenta",
      description: "Regístrate con tu email y crea tu perfil en menos de 2 minutos."
    },
    {
      step: 2,
      title: "Crea un nuevo viaje",
      description: "Define los detalles básicos: nombre, fechas, destino y descripción."
    },
    {
      step: 3,
      title: "Invita participantes",
      description: "Añade amigos, familiares o compañeros de viaje al grupo."
    },
    {
      step: 4,
      title: "Planifica juntos",
      description: "Usen polls para decidir, añadan gastos y creen el itinerario perfecto."
    }
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <HelpCircle size={80} className={styles.heroIcon} />
          <h1 className={styles.heroTitle}>Centro de Ayuda</h1>
          <p className={styles.heroDescription}>
            Encuentra respuestas a las preguntas más frecuentes y aprende a 
            sacar el máximo provecho de UnifyTrip
          </p>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className={styles.quickStart}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Guía rápida de inicio</h2>
          <p className={styles.sectionDescription}>
            Sigue estos pasos para organizar tu primer viaje grupal
          </p>
        </div>
        
        <div className={styles.stepsGrid}>
          {quickStart.map((item) => (
            <div key={item.step} className={styles.stepCard}>
              <div className={styles.stepNumber}>{item.step}</div>
              <h3 className={styles.stepTitle}>{item.title}</h3>
              <p className={styles.stepDescription}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faq}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Preguntas frecuentes</h2>
          <p className={styles.sectionDescription}>
            Respuestas a las dudas más comunes sobre UnifyTrip
          </p>
        </div>

        <div className={styles.faqCategories}>
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className={styles.faqCategory}>
              <div className={styles.categoryHeader}>
                {category.icon}
                <h3 className={styles.categoryTitle}>{category.category}</h3>
              </div>
              
              <Accordion.Root type="multiple" className={styles.accordionRoot}>
                {category.questions.map((faq, faqIndex) => (
                  <Accordion.Item 
                    key={faqIndex} 
                    value={`item-${categoryIndex}-${faqIndex}`}
                    className={styles.accordionItem}
                  >
                    <Accordion.Header className={styles.accordionHeader}>
                      <Accordion.Trigger className={styles.accordionTrigger}>
                        <span>{faq.question}</span>
                        <ChevronDown size={20} className={styles.accordionChevron} />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className={styles.accordionContent}>
                      <div className={styles.accordionContentText}>
                        <p>{faq.answer}</p>
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contact}>
        <div className={styles.contactContent}>
          <h2 className={styles.sectionTitle}>¿Necesitas más ayuda?</h2>
          <p className={styles.sectionDescription}>
            Si no encontraste la respuesta que buscabas, no dudes en contactarnos. 
            Estamos aquí para ayudarte a que tu experiencia con UnifyTrip sea perfecta.
          </p>
          
          <div className={styles.contactMethods}>
            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}>
                <Mail size={32} />
              </div>
              <h3>Email</h3>
              <p>support@unifytrip.com</p>
              <span className={styles.responseTime}>Respuesta en 24h</span>
            </div>
            
            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}>
                <MessageCircle size={32} />
              </div>
              <h3>Chat en vivo</h3>
              <p>Disponible en la app</p>
              <span className={styles.responseTime}>Lun-Vie 9:00-18:00</span>
            </div>
            
            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}>
                <Phone size={32} />
              </div>
              <h3>Teléfono</h3>
              <p>+34 900 123 456</p>
              <span className={styles.responseTime}>Lun-Vie 9:00-18:00</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}