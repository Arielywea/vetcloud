# VetCloud — Auditoría Funcional + Seguridad

**Fecha**: 2026-08-05
**Versión**: 1.0
**Estado**: Aprobado para implementación

## Contexto

VetCloud es un SaaS de gestión veterinaria con 17 pantallas, 52 endpoints, y 10 entidades de datos. Se identificaron problemas críticos de seguridad (SQL injection, user scoping roto) y funcionalidad (3 pantallas con datos mock, 3 pantallas ocultas). Este plan aborda ambos en un enfoque paralelo.

## Arquitectura Actual

- **Stack**: Expo web + Express serverless on Vercel + Neon PostgreSQL
- **Auth**: JWT con RUT + password
- **DB**: PostgreSQL con 10 tablas + 87 enfermedades seed
- **API**: 52 endpoints REST

## Track A — Seguridad

### A1: SQL Injection Fix

**Problema**: 7 endpoints PATCH usan `Object.entries(req.body)` con keys interpoladas directamente en SQL como nombres de columna. Un atacante puede inyectar `{"id = 1; DROP TABLE diseases; --": "val"}`.

**Solución**: Crear función helper `sanitizeColumns(allowed, body)` que solo extrae keys permitidas.

**Archivos afectados**: `server.js` (7 endpoints PATCH)
**Endpoint afectados**:
- `PATCH /items/diseases/:id`
- `PATCH /items/pets/:id`
- `PATCH /items/personal_notes/:id`
- `PATCH /items/appointments/:id`
- `PATCH /items/clinical_records/:id`
- `PATCH /items/inventory/:id`
- `PATCH /items/prescriptions/:id`

**Implementación**:
```javascript
function sanitizeColumns(allowed, body) {
  const safe = {};
  for (const key of Object.keys(body)) {
    if (allowed.includes(key)) {
      safe[key] = body[key];
    }
  }
  return safe;
}
```

### A2: User Scoping

**Problema**: Varias entidades no filtran por `user_id` en queries SELECT, permitiendo que un usuario vea datos de otros usuarios.

**Solución**: Agregar `WHERE user_id = $X` a queries de:
- `GET /items/pets`
- `GET /items/personal_notes`
- `GET /items/favorites`
- `GET /items/appointments`
- `GET /items/clinical_records`
- `GET /items/inventory`
- `GET /items/reminders`
- `GET /items/prescriptions`

**Archivos afectados**: `server.js` (~15 queries SELECT)

### A3: Upload Fix

**Problema**: `POST /files` usa `multer.memoryStorage()` pero nunca guarda el buffer a disco. El archivo se pierde.

**Solución**: Migrar a Cloudinary (ya funciona para fotos de mascotas). Eliminar `POST /files` roto.

**Archivos afectados**: `server.js`, `services/cloudinary.ts`

### A4: XSS en Emails

**Problema**: `prescription_body` se inyecta en HTML con solo `replace(/\n/g, '<br>')` sin escape de HTML entities.

**Solución**: Función `escapeHtml(str)` que escapa `&`, `<`, `>`, `"`, `'`.

**Archivos afectados**: `server.js` (prescriptions email, reminders send-pending)

### A5: Input Validation

**Problema**: Ningún endpoint valida formato de inputs.

**Solución**: Validar:
- UUID format en parámetros de ruta
- Enum values (species, severity, record_type, appointment_type, status)
- Required fields en POST endpoints

**Archivos afectados**: `server.js` (~20 endpoints POST/PATCH)

### A6: Rate Limiting

**Problema**: Sin límite de intentos en login ni en envío de emails.

**Solución**:
- Login: max 5 intentos por minuto por IP
- Email endpoints: max 10 por hora por usuario

**Archivos afectados**: `server.js`

## Track B — Funcionalidad

### B1: Hospitalización Real

**Problema**: `hospitalizacion.tsx` muestra datos mock hardcodeados.

**Solución**:
1. Crear tabla `hospitalizations`:
   - `id` UUID PK
   - `pet_id` UUID FK → pets
   - `user_id` UUID FK → users
   - `admission_date` TIMESTAMPTZ
   - `discharge_date` TIMESTAMPTZ NULL
   - `reason` TEXT
   - `status` VARCHAR(20): internado/cirugia/recuperacion/discharged
   - `veterinarian` VARCHAR(255)
   - `notes` TEXT
   - `created_at` TIMESTAMPTZ

2. CRUD API en `server.js`:
   - `GET /items/hospitalizations` (con filtros)
   - `POST /items/hospitalizations`
   - `PATCH /items/hospitalizations/:id`
   - `DELETE /items/hospitalizations/:id`

3. Conectar `hospitalizacion.tsx` a datos reales

### B2: Laboratorio Real

**Problema**: `laboratorio.tsx` muestra datos mock hardcodeados.

**Solución**:
1. Crear tabla `lab_exams`:
   - `id` UUID PK
   - `pet_id` UUID FK → pets
   - `user_id` UUID FK → users
   - `exam_name` VARCHAR(255)
   - `exam_type` VARCHAR(50)
   - `status` VARCHAR(20): pendiente/completado
   - `result` TEXT NULL
   - `date` TIMESTAMPTZ
   - `veterinarian` VARCHAR(255)
   - `created_at` TIMESTAMPTZ

2. CRUD API en `server.js`

3. Conectar `laboratorio.tsx` a datos reales

### B3: Reportes Reales

**Problema**: `reportes.tsx` y dashboard muestran datos mock.

**Solución**:
1. Crear endpoints de estadísticas:
   - `GET /stats/dashboard` (totales de pets, appointments, records, low-stock)
   - `GET /stats/weekly` (consultas por día de la semana)
   - `GET /stats/record-types` (breakdown por tipo de record)

2. Conectar `reportes.tsx` y `index.tsx` a datos reales

### B4: Pantallas Ocultas

**Problema**: `notes.tsx`, `search.tsx`, `reminders.tsx` existen pero no están en el sidebar.

**Solución**:
1. Agregar al sidebar en `Sidebar.tsx`
2. Agregar a `SCREEN_TITLES` en `_layout.tsx`
3. Evaluar si `search.tsx` es redundante con CommandPalette

## Fase Final — Integración y Polish

### F1: Schema/Type Sync

- Agregar `life_stage` column a diseases (ya en TS, falta en SQL)
- Agregar `veterinarian`, `status`, `pet_id`, `room` a appointments (ya en TS, falta en SQL)
- Renombrar `references_list` → `references` en diseases (o viceversa)

### F2: Empty Catch Blocks

- Configuracion: agregar toast de error en `handleNotiToggle` y `handleSave`
- Notes: agregar toast de error en create/update/delete

### F3: Password Policy

- Mínimo 8 caracteres
- Al menos 1 mayúscula, 1 minúscula, 1 número

### F4: Paginación

- Agregar `?page=1&limit=20` a endpoints principales
- Implementar en hooks del cliente

### F5: Admin Panel Auth

- Proteger `/admin` con JWT verification

## Orden de Implementación

```
Fase 1 (Seguridad): A1 → A2 → A3 → A4 → A5 → A6
Fase 2 (Funcionalidad): B1 → B2 → B3 → B4 (en paralelo con Fase 1)
Fase 3 (Integración): F1 → F2 → F3 → F4 → F5
```

## Criterios de Aceptación

- [ ] Ningún endpoint PATCH acepta columnas no whitelistadas
- [ ] Todos los endpoints filtran por user_id
- [ ] Upload de archivos funciona (Cloudinary o disco)
- [ ] Emails no contienen XSS
- [ ] Inputs validados en todos los POST/PATCH
- [ ] Rate limiting activo en login y emails
- [ ] Hospitalización muestra datos reales
- [ ] Laboratorio muestra datos reales
- [ ] Reportes muestran datos reales
- [ ] Notes, Search, Reminders accesibles desde sidebar
- [ ] Schema SQL coincide con tipos TypeScript
- [ ] Password mínimo 8 caracteres
- [ ] Paginación en endpoints principales
- [ ] Admin panel protegido
