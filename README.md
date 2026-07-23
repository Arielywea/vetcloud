# VetCloud 🐶

Sistema de gestión veterinaria web y móvil. App de React Native (Expo) con API Express.js, desplegada en Vercel con Neon PostgreSQL.

## Características

- 🐾 **Gestión de pacientes** — Registro completo con perfil, historial clínico y estado reproductivo
- 📋 **Catálogo de enfermedades** — 39+ enfermedades caninas y felinas con patofisiología, signos, diagnóstico y tratamiento
- 💊 **Recetas veterinarias** — Generación de recetas con PDF adjunto y envío por correo
- 📅 **Agenda médica** — Calendario de citas y consultas
- 📝 **Notas personales** — Casos clínicos con vinculación a mascotas/enfermedades
- 📦 **Inventario** — Control de stock con alertas de bajo inventario
- 🎨 **12 paletas de temáticas** — One Piece, Gurren Lagann, Slam Dunk, Dragon Ball Z, Vinland Saga, 86, Fate, Frieren, Pandora Hearts, Saber/Artoria, NERV y predeterminada
- 🐕 **Logo beagle** — Branding minimalista con SVG
- 🔒 **Seguridad** — JWT auth, bcrypt passwords, endpoints protegidos

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Deploy)                       │
│  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │  React Native    │  │  Express.js API (server.js)  │  │
│  │  (Expo Web)      │  │  Puerto: 8055                │  │
│  └─────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │  Neon DB    │
                    │  PostgreSQL │
                    └─────────────┘
```

## Requisitos

- [Node.js](https://nodejs.org/) v18+
- npm
- Cuenta en [Vercel](https://vercel.com) (deploy)
- Cuenta en [Neon](https://neon.tech) (base de datos)

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y completa:

```bash
cp .env.example .env
```

Variables requeridas:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de conexión a Neon PostgreSQL |
| `JWT_SECRET` | Secreto para JWT (generar con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `SMTP_EMAIL` | Correo Gmail para envío de recetas |
| `SMTP_PASSWORD` | Contraseña de aplicación de Google |

### 3. Ejecutar migraciones

```bash
node -e "const {Pool}=require('pg');const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});p.query('SQL_AQUI').then(r=>{console.log('OK');p.end()})"
```

Migraciones disponibles en `scripts/`:
- `add-auth.sql` — Tabla users con auth
- `add-theme-column.sql` — Preferencia de tema
- `add-pet-status.sql` — Estado de mascota (vivo/fallecido)
- `add-prescriptions-table.sql` — Tabla de recetas
- `add-user-profile-columns.sql` — Campos de perfil (clínica, SMTP)
- `add-color-palette-column.sql` — Paleta de colores personalizada

### 4. Sembrar usuarios

```bash
node scripts/seed-users.js
```

Usuarios por defecto:
- **Ariel** — RUT: `21293992-7`, Password: `1245`
- **Paz Quintana** — RUT: `21392885-6`, Password: `1245`

### 5. Sembrar enfermedades

```bash
npx ts-node scripts/seed-diseases.ts
```

### 6. Iniciar desarrollo

```bash
npx expo start
```

Presiona `w` para abrir en navegador web.

## Estructura del Proyecto

```
vet-cloud/
├── app/
│   ├── (drawer)/           # Pantallas principales (drawer navigation)
│   │   ├── index.tsx       # Dashboard
│   │   ├── pacientes.tsx   # Lista de pacientes
│   │   ├── diseases.tsx    # Catálogo de enfermedades
│   │   ├── agenda.tsx      # Calendario de citas
│   │   ├── notes.tsx       # Notas personales
│   │   ├── inventario.tsx  # Control de inventario
│   │   ├── profile.tsx     # Perfil y personalización
│   │   ├── search.tsx      # Búsqueda global
│   │   ├── add-paciente.tsx
│   │   └── add-disease.tsx
│   ├── auth/
│   │   └── login.tsx       # Pantalla de login
│   ├── pet/[id].tsx        # Detalle de mascota + recetas
│   ├── disease/[id].tsx    # Detalle de enfermedad
│   └── _layout.tsx         # Root layout
├── components/
│   ├── BeagleLogo.tsx      # Logo SVG beagle
│   ├── DrawerContent.tsx   # Menú drawer
│   ├── PetHeader.tsx       # Header de mascota
│   ├── ClinicalTabs.tsx    # Tabs de historial clínico
│   ├── AgendaWidget.tsx    # Widget de agenda
│   └── TaskWidget.tsx      # Widget de tareas
├── constants/
│   ├── colors.ts           # Temas de colores (12 paletas)
│   ├── diseases.ts         # Datos de enfermedades
│   ├── breeds.ts           # Razas
│   └── vaccinations.ts     # Protocolos de vacunación
├── contexts/
│   └── ThemeContext.tsx     # Proveedor de temas
├── hooks/
│   ├── useAuth.tsx         # Autenticación
│   └── useDirectus.ts      # Hooks de datos
├── services/
│   ├── auth.ts             # API de autenticación
│   ├── directus.ts         # API de datos
│   ├── files.ts            # Subida de archivos
│   └── cloudinary.ts       # Cloudinary
├── utils/
│   ├── age.ts              # Cálculo de edad
│   └── generatePrescriptionPdf.js  # Generación PDF
├── server.js               # API Express.js
├── admin.html              # Panel admin
├── package.json
└── .env.example
```

## Paletas de Colores

| # | Paleta | Light | Dark |
|---|--------|-------|------|
| — | Predeterminada | Purple/beige | — |
| 1 | One Piece | Rojo pirata | Rojo oscuro/azul |
| 2 | Gurren Lagann | Rojo mecha | Rojo neón/negro |
| 3 | Slam Dunk | Naranja cancha | Naranja/negro |
| 4 | Dragon Ball Z | Naranja/azul | Dorado/negro |
| 5 | Vinland Saga | Tierra/madera | Marrón/negro |
| 6 | 86 | Militar rojo | Gris/rojo |
| 7 | Fate Series | Dorado/azul | Dorado/azul oscuro |
| 8 | Frieren | Púrpura etéreo | Púrpura/negro |
| 9 | Pandora Hearts | Gótico rosa | Rosa/negro |
| 10 | Saber/Artoria | Azul royal/dorado | Púrpura/dorado |
| 11 | NERV | — | Naranja/negro |

## API Endpoints

### Auth
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Login con RUT + password |
| GET | `/auth/me` | Obtener usuario actual |
| PATCH | `/auth/profile` | Actualizar perfil |
| PATCH | `/auth/password` | Cambiar contraseña |

### Datos (requieren JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET/POST | `/items/pets` | Pacientes |
| GET/POST | `/items/clinical_records` | Registros clínicos |
| GET/POST | `/items/prescriptions` | Recetas |
| POST | `/items/prescriptions/:id/email` | Enviar receta por correo |
| GET/POST | `/items/appointments` | Citas |
| GET/POST | `/items/personal_notes` | Notas |
| GET/POST | `/items/inventory` | Inventario |

### Enfermedades (lectura pública, escritura requiere auth)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/items/diseases` | Listar enfermedades |
| GET | `/items/diseases/:id` | Detalle de enfermedad |
| POST | `/items/diseases` | Crear (auth) |
| PATCH | `/items/diseases/:id` | Actualizar (auth) |
| DELETE | `/items/diseases/:id` | Eliminar (auth) |

## Deploy en Vercel

1. Conectar repositorio GitHub a Vercel
2. Configurar variables de entorno en Vercel Dashboard
3. Deploy automático al hacer push a `master`

Variables de entorno en Vercel:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `JWT_SECRET` — Secreto JWT
- `SMTP_EMAIL` — noreply.vetcloud@gmail.com
- `SMTP_PASSWORD` — Contraseña de aplicación Gmail

## Seguridad

- JWT authentication con bcrypt password hashing
- Endpoints de datos protegidos con auth middleware
- CORS restringido
- Errores sanitizados (no exponen detalles internos)
- Credenciales nunca hardcodeadas en el repo

## Licencia

Uso personal.
