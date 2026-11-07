# Vet Avalon

Ficha clínica veterinaria para perros y gatos, hecha en Chile. App web instalable (PWA) en Expo y React Native Web, con una API Express y PostgreSQL en Neon, desplegada en Vercel.

Estado: alpha cerrada (noviembre de 2026).

## Qué hace

- **Pacientes y tutores**: ficha por paciente con tutor (RUT, teléfono, correo), alertas, peso, estado y foto. Solo perros y gatos.
- **Consulta en una pantalla**: anamnesis remota que el tutor responde desde un enlace, signos vitales, examen físico, lista de problemas, diagnóstico y plan.
- **Documentos en PDF**: receta, certificado de vacunas, resumen de visita, orden de exámenes y ficha completa, con firma, timbre y datos del profesional. La receta y el resumen también se envían por correo.
- **Vacunas y desparasitaciones**: plan por especie, dosis con fecha estimada y recordatorios.
- **Agenda**: citas, controles y la vista del día como Mesa Redonda (08:00 a 20:00).
- **Hospitalización, laboratorio e inventario**, con avisos automáticos de la clínica (stock bajo, vacunas vencidas, checklist de alta).
- **Apoyo clínico**: catálogo de 200 enfermedades caninas y felinas ordenado por frecuencia en Chile, vademécum de 240 medicamentos con dosis por peso, 20 guías quirúrgicas paso a paso, fluidoterapia AAHA 2024 y calculadora de dosis.
- **Notas** con editor de bloques y **reportes** de la clínica.
- **Cuenta**: registro con aceptación de Términos y Privacidad, recuperación de contraseña por correo, exportación de todos los datos (JSON y CSV) y códigos de invitación para la alpha.

El catálogo, las guías y las calculadoras son material de apoyo: la decisión clínica es siempre del veterinario tratante.

## Arquitectura

```
Navegador / app instalada (PWA)
        │
        ▼
Vercel ── dist/ (export web de Expo, estático)
   │
   └── /auth, /items, /account, ... ──► api/index.js ──► server.js (Express)
                                                            │
                                                            ▼
                                                   Neon PostgreSQL (SQL directo con pg, sin ORM)
```

- `server.js` es toda la API. `api/index.js` solo lo envuelve para Vercel.
- `services/directus.ts` es el cliente HTTP de la API propia (el nombre es histórico: no hay Directus).
- Cada prefijo de ruta de la API necesita su rewrite en `vercel.json`; el resto cae en `index.html`.

## Requisitos

- Node.js 18 o superior y npm
- Una base PostgreSQL (Neon) y, para desplegar, un proyecto en Vercel
- Una cuenta de correo con contraseña de aplicación para los envíos (Gmail por defecto)

## Puesta en marcha

```bash
npm install
cp .env.example .env
node scripts/run-migrations.js
npm run server
npm run web
```

`npm run server` levanta la API en el puerto 8055 y `npm run web` abre la app en el navegador.

**Importante:** si `DATABASE_URL` apunta a producción, la API local escribe en producción. Usa una rama de desarrollo de Neon, y cualquier prueba que escriba datos debe ir dentro de `BEGIN … ROLLBACK`.

### Variables de entorno

| Variable | Para qué |
|----------|----------|
| `DATABASE_URL` | Conexión a PostgreSQL (Neon) |
| `JWT_SECRET` | Firma de las sesiones. Genera uno con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `EXPO_PUBLIC_API_URL` | URL de la API que usa la app (en local, `http://localhost:8055`) |
| `SMTP_SERVICE`, `SMTP_EMAIL`, `SMTP_PASSWORD` | Envío de recetas, resúmenes, recordatorios y recuperación de contraseña |
| `APP_URL` | URL pública de la app; arma el enlace del correo de recuperación de contraseña |
| `REQUIRE_INVITE` | `true` para que el registro exija un código de invitación (alpha cerrada) |
| `CORS_ORIGIN` | Orígenes permitidos para la API |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`, `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Subida de fotos de pacientes |

`.env` contiene credenciales reales: no se sube al repositorio ni se comparte.

## Comandos

| Comando | Qué hace |
|---------|----------|
| `npm run server` | API local en :8055 |
| `npm run web` | App en modo desarrollo |
| `npm run build:web` | Export web a `dist/` e inyección de la PWA (lo mismo que corre Vercel) |
| `npm run typecheck` | `tsc` sobre la app; debe dar 0 errores |
| `npm run check:schema` | Verifica que las columnas que usa `server.js` existan en la BD y que cada ruta tenga rewrite. Córrelo antes de cada push |
| `node scripts/run-migrations.js` | Aplica las migraciones pendientes |
| `node scripts/invite-code.js` | Crea, lista o desactiva códigos de invitación |

### Migraciones

Cada cambio de esquema va en `scripts/migrations/NNN_nombre.sql` (idempotente, con `IF NOT EXISTS`) y en la lista `MIGRATIONS` de `scripts/run-migrations.js`. El script registra lo aplicado en la tabla `_migrations` y salta lo que ya corrió. Los `.sql` sueltos de `scripts/` son históricos.

Si agregas un campo a un formulario, agrégalo también a la whitelist del servidor (`PET_COLUMNS` o el `allowed` del handler) y a la migración.

### Códigos de invitación

```bash
node scripts/invite-code.js create MESAREDONDA --label "Compañeros" --max-uses 20 --days 30
node scripts/invite-code.js list
node scripts/invite-code.js disable MESAREDONDA
```

Cada código tiene usos máximos, vencimiento opcional y días de prueba. La cuenta guarda con qué código llegó.

## Estructura

```
app/
  (drawer)/          pantallas con barra lateral: inicio, pacientes, agenda, enfermedades,
                     vademécum, cirugías, hospitalización, laboratorio, inventario, avisos,
                     fluidoterapia, dosis, reportes, notas, recordatorios, configuración
  consulta/[petId]   la consulta
  pet/[id]           ficha del paciente
  owner/, disease/, surgery/, notes/
  auth/login.tsx     ingreso, registro y recuperación de contraseña
  f/[token].tsx      anamnesis que responde el tutor (pública)
  restablecer.tsx, terminos.tsx, privacidad.tsx   páginas públicas
components/          por área (consulta, pet, agenda, dashboard, exams, profile, legal, ui...)
constants/           colores y tokens del diseño, textos legales, catálogos de apoyo
services/            auth.ts (sesión) y directus.ts (cliente de la API)
utils/               generadores de PDF (pdfLayout.js y generate*Pdf.js), fechas, identidad (RUT)
public/              manifest, service worker e íconos de la PWA
scripts/             migraciones, verificación de esquema, importadores y utilidades
server.js            la API completa
api/index.js         envoltorio para Vercel
```

## Diseño

Dos temas, definidos en `constants/colors.ts`: **Camelot** (claro: azul real, oro antiguo y marfil, del escudo de `assets/logo.png`) y **Morgana** (oscuro: casi negro, carmesí y oro pálido). Inter para la interfaz y Cormorant Garamond para títulos, esquinas rectas, sin sombras en lo que está en reposo y sin emojis como iconos. Las reglas completas están en `CLAUDE.md`.

## API

Todas las rutas, salvo las públicas, exigen `Authorization: Bearer <token>`. Los errores de validación responden 400 con un mensaje en español.

| Prefijo | Contenido |
|---------|-----------|
| `/auth` | Registro, ingreso, perfil, contraseña y su recuperación, firma y timbre, información del registro |
| `/items` | Pacientes, tutores, consultas, recetas, vacunas, citas, exámenes, hospitalizaciones, inventario, notas, recordatorios, catálogos y PDFs |
| `/account` | Exportación de datos de la cuenta |
| `/appointments`, `/vital-measurements`, `/payments` | Agenda, signos vitales y pagos |
| `/reports`, `/stats`, `/search` | Reportes, cifras del inicio y búsqueda global |
| `/public` | Anamnesis del tutor por enlace (sin sesión) |
| `/files`, `/assistant` | Adjuntos y asistente |

## Despliegue

Vercel despliega solo al hacer push a `master`. El build corre `npx expo export --platform web && node scripts/inject-pwa.js` y sirve `dist/`; la API corre como función en `api/index.js`. Las variables de entorno se configuran en el panel de Vercel, y las migraciones se aplican antes de desplegar código que las necesite.

## Seguridad y datos

- Contraseñas con bcrypt, sesiones JWT y límites de intentos en ingreso, registro y recuperación.
- Cada consulta filtra por la cuenta del usuario; las referencias que llegan del cliente se verifican.
- La firma y el timbre son privados: solo se usan al generar los PDF de esa cuenta.
- Aceptación de Términos y Privacidad registrada con versión, fecha e IP (Ley 21.719).
- El veterinario es responsable de los datos de sus tutores; Vet Avalon es encargado del tratamiento.
- Errores registrados en los logs del servidor sin exponer detalles al cliente.

## Licencia

Software propietario. Todos los derechos reservados. Ver Términos y condiciones en la app.
