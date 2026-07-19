# VetCloud - App Veterinaria Personal

Aplicación veterinaria con base de datos Directus + PostgreSQL, desplegada localmente con Docker.

## Características

- 📚 **Catálogo de enfermedades** (perros y gatos) con signos, diagnóstico, tratamiento y prevención
- 🐾 **Gestión de mascotas** con perfil y historial médico
- 🔍 **Búsqueda avanzada** por nombre o síntomas
- 📝 **Notas personales** para casos clínicos
- ❤️ **Favoritos** para acceso rápido
- 📸 **Almacenamiento de archivos** (imágenes, PDFs, documentos)
- ✏️ **Edición desde Admin UI** (Directus Studio)

## Arquitectura

```
┌─────────────────────────────────────────────────┐
│              Docker Compose (Local)              │
├─────────────────────────────────────────────────┤
│  PostgreSQL 16  │  Redis 6  │  Directus 11      │
│  Puerto: 5432   │  6379     │  Puerto: 8055     │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│           VetCloud App (React Native)            │
│           Puerto: 8081 (Expo)                    │
└─────────────────────────────────────────────────┘
```

## Requisitos Previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado
- [Node.js](https://nodejs.org/) v18+ instalado
- npm o yarn

## Instalación

### 1. Instalar dependencias de la app

```bash
cd C:\Users\Ariel\vet-cloud
npm install
```

### 2. Iniciar Docker (Directus + PostgreSQL)

```bash
cd docker
docker compose up -d
```

Espera a que todos los servicios estén listos (~1-2 minutos).

### 3. Verificar que Directus está corriendo

Abre en tu navegador:
```
http://localhost:8055
```

Credenciales:
- **Email:** admin@vetcloud.local
- **Password:** Admin123!

### 4. Crear las tablas en Directus

Opción A: Usar el script SQL (recomendado)

1. Abre Directus Studio en `http://localhost:8055`
2. Ve a **Settings** → **Data Model**
3. Crea las collections manualmente siguiendo el esquema en `scripts/schema.sql`

Opción B: Crear desde el Admin UI

1. Ve a **Content** → **Create Collection**
2. Crea las siguientes collections:
   - `diseases`
   - `pets`
   - `medical_records`
   - `personal_notes`
   - `favorites`

### 5. Sembrar datos de enfermedades

```bash
npx ts-node scripts/seed-diseases.ts
```

Esto importará las 30+ enfermedades (perros y gatos) a la base de datos.

### 6. Iniciar la app

```bash
npx expo start
```

Presiona `w` para abrir en navegador web.

## Estructura del Proyecto

```
vet-cloud/
├── docker/
│   ├── docker-compose.yml    # Configuración Docker
│   ├── .env                  # Variables de entorno
│   ├── data/database/        # Datos PostgreSQL
│   ├── uploads/              # Archivos subidos
│   └── extensions/           # Extensiones Directus
├── app/
│   ├── (tabs)/              # Pantallas principales
│   ├── disease/[id].tsx     # Detalle de enfermedad
│   └── pet/[id].tsx         # Detalle de mascota
├── services/
│   ├── directus.ts          # Cliente Directus SDK
│   └── files.ts             # Servicio de archivos
├── hooks/
│   └── useDirectus.ts       # Hooks para datos
├── scripts/
│   ├── schema.sql           # Esquema de base de datos
│   └── seed-diseases.ts     # Script de importación
├── constants/
│   ├── diseases.ts          # Datos de enfermedades
│   ├── colors.ts            # Colores de la app
│   ├── breeds.ts            # Razas de mascotas
│   └── vaccinations.ts      # Protocolos de vacunación
└── config.ts                # Configuración de Directus
```

## Edición de Datos

### Desde Directus Admin UI (http://localhost:8055)

1. **Enfermedades:**
   - Content → Diseases → Click "+" para agregar
   - Editar campos: nombre, signos (JSON), tratamiento (JSON)
   - Subir imágenes desde Files

2. **Mascotas:**
   - Content → Pets → Click "+" para registrar
   - Editar datos, subir foto

3. **Historial Médico:**
   - Content → Medical Records → Click "+"
   - Vincular mascota y enfermedad
   - Subir PDFs de exámenes

4. **Notas:**
   - Content → Personal Notes → Click "+"
   - Agregar etiquetas para organizar

### Desde la App

- Los cambios en Directus se reflejan automáticamente en la app
- La app usa la API REST de Directus para obtener datos
- Soporte para real-time vía WebSocket

## Comandos Útiles

```bash
# Iniciar servicios Docker
docker compose up -d

# Detener servicios Docker
docker compose down

# Ver logs de Directus
docker logs vetcloud-directus

# Ver logs de PostgreSQL
docker logs vetcloud-postgres

# Reiniciar Directus
docker compose restart directus

# Ejecutar seed de datos
npx ts-node scripts/seed-diseases.ts

# Iniciar app en modo desarrollo
npx expo start
```

## Solución de Problemas

### Directus no carga

```bash
# Verificar que los contenedores están corriendo
docker ps

# Ver logs de error
docker logs vetcloud-directus

# Reiniciar todo
docker compose down && docker compose up -d
```

### Error de conexión a base de datos

1. Verifica que PostgreSQL está corriendo: `docker logs vetcloud-postgres`
2. Verifica las credenciales en `docker/.env`
3. Espera 30 segundos después de iniciar para que la DB esté lista

### App no conecta con Directus

1. Verifica que Directus está en `http://localhost:8055`
2. Verifica la IP en `config.ts`
3. Si usas emulador, usa `10.0.2.2:8055` en lugar de `localhost`

## Licencia

Uso personal.
