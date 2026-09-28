# VetCloud

Software de gestión clínica veterinaria. Expo 52 (React Native Web, expo-router) exportado como web estática + API Express en un solo `server.js`, desplegado en Vercel (`api/index.js` envuelve `server.js`). Base de datos PostgreSQL en Neon con SQL directo (`pg`), sin ORM.

## Comandos

- `npm run server` — API local en :8055 (usa `DATABASE_URL` de `.env`, que apunta a **producción** en Neon)
- `npm run web` — Expo web en desarrollo; `npx expo export --platform web` para el build
- `npm run typecheck` — `tsc`; hay ~89 errores previos (sobre todo en `data/*.ts`). No agregues nuevos: compara antes/después
- `npm run check:schema` — verifica que las columnas que usa `server.js` existan en la BD y que cada ruta de la API tenga rewrite en `vercel.json`. Córrelo antes de cada push
- `node scripts/run-migrations.js` — aplica migraciones pendientes (idempotentes, `IF NOT EXISTS`)

## Base de datos y API

- Todo cambio de esquema va en `scripts/migrations/NNN_nombre.sql` **y** en la lista `MIGRATIONS` de `scripts/run-migrations.js`. Usa `/create-migration`.
- Si agregas un campo a un formulario, agrégalo también a la whitelist del servidor (`PET_COLUMNS` para pacientes, o el `allowed` del handler) y a la migración. Si falta en cualquiera de los tres, el dato se pierde en silencio o da error 500.
- Toda ruta nueva con un prefijo nuevo (`/foo/...`) necesita su rewrite en `vercel.json`; si no, Vercel responde `index.html` con status 200.
- Cada `catch` de un handler debe llamar a `logError(req, err)` antes de responder 500. Sin eso el error no aparece en los logs de Vercel.
- Valida la entrada en el servidor y responde 400 con un mensaje en español (ver `normalizePet`, `parseDateInput`).
- `services/directus.ts` es el cliente HTTP de la API propia; el nombre "directus" es histórico, no hay Directus. Exporta `api`, no `directus`.

## Diseño (Saber / Alter)

- Tema claro **Saber**: azul real, oro antiguo y marfil (del escudo en `assets/logo.png`). Tema oscuro **Alter**: casi negro, carmesí para marcas y oro pálido para lo interactivo. Definidos en `constants/colors.ts`; no hay paletas extra.
- Nunca pongas colores fijos (`'#FFF'`, `'#C9A227'`, grises) en componentes. Usa `useTheme()`:
  - texto sobre `colors.primary` → `onPrimaryText.default`
  - texto sobre `colors.accent` (botón primario) → `onAccentText.default`
  - barra lateral, encabezados, hero → fondo `colors.chrome`, texto `onChromeText`
- El dorado (`accent` en Saber) no se usa para texto pequeño (contraste 3.4:1): solo iconos, líneas y botones.
- Tipografía: Inter para toda la interfaz (se carga en `utils/webFonts.ts`). `components/ui/DisplayText.tsx` (Cormorant Garamond) **solo** para títulos de página, el logotipo y el nombre del paciente; nunca en etiquetas, botones o datos.
- Iconos: `components/icons/VetCloudIcon.tsx` para navegación (trazo 1.75), `lucide-react-native` para el resto, `SpeciesIcon` para perro/gato. Sin emojis como iconos. `CrestStar` es el único ornamento; úsalo con moderación.
- Movimiento: ≤250 ms, curva ease-out fuerte, solo `transform`/`opacity`. Sin animaciones de entrada coreografiadas en pantallas que se abren a diario. Botones: escala 0.97 al presionar, nada más.
- Sombras: suaves (`SHADOWS` en `constants/tokens.ts`). Declara la elevación una vez: sombra **o** borde, no ambos.

## Datos sensibles

- `.env`, `docker/.env`, `api/.env` y `backup.sql` contienen credenciales o datos reales: no los edites ni los muestres.
- La API local usa la base de datos de producción: cualquier prueba que escriba datos debe ir dentro de `BEGIN … ROLLBACK`.
