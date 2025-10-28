# UnifyTrip

UnifyTrip es una aplicación web completa para la planificación y gestión de viajes colaborativos. Permite a los usuarios crear viajes, invitar participantes, gestionar gastos, crear itinerarios y tomar decisiones grupales a través de encuestas.

## 🚀 Características

- **Gestión de Viajes**: Crea y administra viajes con múltiples participantes
- **Sistema de Invitaciones**: Invita a amigos y familiares a tus viajes
- **Gestión de Gastos**: Lleva un control detallado de los gastos del viaje
- **Itinerarios**: Planifica actividades y lugares a visitar
- **Sistema de Encuestas**: Toma decisiones grupales de forma democrática
- **Autenticación Segura**: Sistema de login y registro de usuarios

## 📁 Estructura del Proyecto

```
UnifyTrip/
├── backend/          # API REST con Node.js y Express
├── frontend/         # Aplicación React con TypeScript
└── README.md         # Este archivo
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **Sequelize** - ORM para base de datos
- **JWT** - Autenticación
- **Jest** - Testing

### Frontend
- **React** - Librería de UI
- **TypeScript** - Lenguaje tipado
- **Vite** - Build tool y dev server
- **CSS Modules** - Estilos modulares

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn
- Base de datos (MySQL/PostgreSQL)

### Backend

1. Navega a la carpeta del backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
# Edita .env con tus configuraciones
```

4. Ejecuta las migraciones:
```bash
npm run migrate
```

5. Inicia el servidor:
```bash
npm start
```

El backend estará disponible en `http://localhost:3000`

### Frontend

1. Navega a la carpeta del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 📚 API Documentation

La API REST proporciona los siguientes endpoints principales:

- `/api/auth` - Autenticación de usuarios
- `/api/trips` - Gestión de viajes
- `/api/expenses` - Gestión de gastos
- `/api/itineraries` - Gestión de itinerarios
- `/api/polls` - Sistema de encuestas
- `/api/invitations` - Sistema de invitaciones
