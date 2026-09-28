---
name: create-migration
description: Create the next numbered SQL migration for VetCloud, register it in run-migrations.js, verify schema drift, and apply it to Neon only after the user confirms. Use when adding or changing database columns or tables.
disable-model-invocation: true
argument-hint: "<descripción del cambio, ej: agregar columna microchip a pets>"
---

# Crear migración

Cambio pedido: $ARGUMENTS

La base de datos en `.env` es **producción** (Neon). Nada se aplica sin confirmación explícita.

## Pasos

1. **Número siguiente.** Lista `scripts/migrations/` y toma el mayor `NNN_` + 1 (tres dígitos).

2. **Escribe `scripts/migrations/NNN_<nombre_snake_case>.sql`**, siempre idempotente:
   - `ALTER TABLE t ADD COLUMN IF NOT EXISTS c TIPO;`
   - `CREATE TABLE IF NOT EXISTS …`, `CREATE INDEX IF NOT EXISTS …`
   - Nada de `DROP` ni `ALTER COLUMN … TYPE` sin preguntar antes: pueden perder datos.
   - JSON → `JSONB`; fechas con hora → `TIMESTAMPTZ`; claves de organización → `INTEGER REFERENCES organizations(id)`.
   - Comentario en la primera línea explicando para qué es.

3. **Regístrala** al final del arreglo `MIGRATIONS` en `scripts/run-migrations.js`.

4. **Actualiza el código que la usa**, en los tres lugares:
   - el formulario / cliente (`services/directus.ts`, tipos en `DirectusPet` etc.)
   - la whitelist del servidor (`PET_COLUMNS` en `server.js` para `pets`, o el `allowed` del handler; y el INSERT si es una tabla con lista estática)
   - la migración

5. **Muestra el SQL y el diff** al usuario y pregunta: "¿Aplico la migración NNN en Neon (producción)?". Espera un sí explícito.

6. **Aplica:** `node scripts/run-migrations.js` (solo corre las que faltan en `_migrations`).

7. **Verifica:** `npm run check:schema` debe salir en verde. Si falla, repórtalo tal cual.

8. No hagas commit ni push salvo que el usuario lo pida.
