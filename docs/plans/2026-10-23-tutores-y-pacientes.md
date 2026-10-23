# Plan: rediseño de Pacientes desde cero (tutores → mascotas → ficha → consultas)

Fecha: 23-10-2026 · Estado: v2, con las decisiones del usuario y la revisión del plan incorporadas

## 1. Método (STORM)

Se usó el método STORM (*Synthesis of Topic Outlines through Retrieval and Multi-perspective question asking*):
1. **Perspectivas.** Se identificaron seis perspectivas expertas que usan o afectan la pestaña.
2. **Preguntas.** Cada perspectiva formuló sus preguntas.
3. **Respuestas.** Se respondieron con evidencia del código y la base actual, y con la normativa chilena.
4. **Síntesis.** Todo se resumió en decisiones y fases.

| # | Perspectiva | Qué le importa |
|---|---|---|
| P1 | Recepción / admisión | Registrar rápido y sin duplicados; encontrar por RUT o nombre de la mascota en segundos |
| P2 | Veterinario en consulta | Ver lo crítico de un vistazo; registrar la consulta sin saltar entre pantallas |
| P3 | Tutor | Que no le pidan los mismos datos por cada mascota; recibir recetas, recordatorios y resúmenes |
| P4 | Integridad de datos | Una entidad tutor real, sin duplicados, migrable, multi-clínica |
| P5 | Normativa chilena | Ley 21.020 (microchip y registro), protección de datos personales (Ley 19.628 y Ley 21.719), conservación de fichas y recetas |
| P6 | Diseño de interacción | Flujo continuo y consistente, sin asistentes de 4 pasos donde no hacen falta |

## 2. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Navegación | Una sola pestaña **Pacientes** con selector segmentado **Mascotas \| Tutores** y una búsqueda universal arriba. Se parte en Mascotas («viene Toby»); pegar un RUT en el buscador lleva al tutor. |
| RUT | **Obligatorio** para crear un tutor, con dígito verificador validado. |
| Cotutores (una segunda persona responsable de la misma mascota, por ejemplo la pareja o un criadero, que también recibe avisos) | **Fuera del alcance.** Basta con un tutor por mascota y un campo de «otro contacto» en el tutor. |
| Pre-registro en línea del tutor | **Fuera** por ahora; el alta reducida a una pantalla y el alta rápida en recepción cubren el caso. |
| Vacunas | Plan base precargado (Óctuple/Séxtuple, KC, Antirrábica, Triple Felina, Leucemia Felina) más un campo libre de producto y lote; los productos que escribe el veterinario se autocompletan en las siguientes aplicaciones. |
| Signos vitales | **Confirmado: se elimina el botón «Signos»** de la ficha y su formulario (temperatura, FC, FR, presión, SpO₂); no se usa en la clínica. La consulta conserva el **peso** y los **hallazgos del examen** como texto libre. |
| Catálogo de enfermedades | **Ampliar a 200 fichas**, ordenarlas **por frecuencia en Chile** y **rediseñar la pestaña Enfermedades** (ver sección 10). |
| Citas sin ficha | Una cita se puede **agendar sin mascota** (por teléfono o WhatsApp, con nombre y teléfono). Al pasar a «en recepción» se exige vincularla: se elige la mascota existente o se hace el alta rápida en ese momento. |
| Borrado de datos | **Sin borrado físico.** Se anonimiza el tutor y se revoca el contacto; las fichas clínicas y las recetas se conservan. |

## 3. Diagnóstico del estado actual (evidencia)

- **El tutor no existe como entidad.** `pets` guarda `tutor_name`, `tutor_rut`, `phone`, `email` y `address` en cada mascota. Un tutor con 3 perros se escribe 3 veces.
- **El alta mezcla dos cosas.** `add-paciente.tsx` (1.228 líneas, 4 pasos) combina el registro con la anamnesis inicial, que en realidad es la primera consulta.
- **Las vacunas son texto libre.** Se guardan en `pets.vaccines` o como `clinical_records` de tipo `vacuna`, sin calendario ni próxima dosis.
- **Las citas se ligan por nombre.** `appointments` usa `patient_name` y `tutor_phone` en texto, y `pet_id` es opcional.
- **El peso vive en tres lugares** (`pets.weight`, `clinical_records.details.weight` y `vital_measurements.weight`) y no está claro cuál manda.
- **No hay estados de ciclo de vida.** No se marca a una mascota fallecida, por lo que podría recibir recordatorios.
- **La ficha está repartida en 7 lugares** (encabezado, historia inicial, última consulta, peso, historial, modales sueltos) y no hay un resumen del estado del paciente.
- **Datos:** 7 pacientes y 7 tutores en producción, así que la migración es simple y verificable a mano.

## 4. Modelo de datos

```
owners (nuevo)
  id, organization_id, user_id,
  name, rut NOT NULL                (canónico: "12345678-K", sin puntos, con guion, K mayúscula)
  phone                             (E.164: "+56912345678")
  alt_contact_name, alt_contact_phone  (otro contacto, en lugar de cotutores)
  email (minúsculas), address, comuna, region,
  preferred_contact ('whatsapp'|'telefono'|'correo'),
  consent_communications_at, contact_revoked_at,
  anonymized_at                     (Ley 21.719: anonimizar en lugar de borrar)
  notes, created_at, updated_at
  UNIQUE (organization_id, rut)

pets (cambia)
  + owner_id → owners.id (ON DELETE RESTRICT: un tutor nunca se borra físicamente)
  + status ('activo'|'fallecido'|'transferido'|'inactivo'), deceased_at
  + species admite 'otro' (+ species_other: conejo, hurón, ave…)
  + registry_number (Registro Nacional de Mascotas), birth_date_estimated (bool)
  + alerts jsonb  [{type:'alergia'|'temperamento'|'cronica'|'medicacion', text, since}]
  + current_weight_kg, current_weight_at   (caché del último peso registrado)
  - tutor_name, tutor_rut, phone, email, address   → se eliminan en la fase 3, tras verificar

vaccinations (nuevo)
  id, pet_id, organization_id, user_id,
  kind ('vacuna'|'desparasitacion_interna'|'desparasitacion_externa'),
  plan_item ('octuple_sextuple'|'kc'|'antirrabica'|'triple_felina'|'leucemia_felina'|'otra'),
  product, lot, applied_at, next_due_at, veterinarian, clinical_record_id, notes

clinical_records (pasa a ser "consulta")
  + appointment_id, + is_initial (primera consulta)
  + weight_kg (columna propia: el único origen del peso)

appointments
  pet_id sigue siendo opcional mientras la cita está «agendada»;
  el servidor lo exige al pasar a «en recepción», «en consulta» o «atendida».
```

**Reglas de datos**
- **Formato canónico.** Una función del servidor normaliza el RUT (quita puntos y espacios, pone guion y K mayúscula, valida el DV) y el teléfono (a E.164 con +56 por defecto) **antes** de guardar y antes de buscar. La detección de duplicados compara solo valores canónicos. En el formulario se muestra el RUT con puntos, solo para leer.
- **Peso.** El **único origen** es `clinical_records.weight_kg`. Al guardar una consulta con peso, el servidor actualiza `pets.current_weight_kg` y `current_weight_at`. La tendencia se calcula con los pesos de las consultas. `pets.weight` y `vital_measurements` quedan en solo lectura y se migran en la fase 3. Nunca se edita el peso en dos lugares.
- **Ciclo de vida.**
  - Marcar a una mascota como fallecida, transferida o inactiva **cancela sus recordatorios pendientes** y la excluye de las campañas automáticas.
  - El generador de recordatorios filtra por `status = 'activo'`, por tutor no anonimizado y por `contact_revoked_at` nulo.
  - La ficha de una mascota fallecida se ve con su estado y la fecha.
- **Anonimización.**
  - «Eliminar datos del tutor» reemplaza nombre, RUT, teléfono, correo y dirección por un marcador («Tutor anonimizado n.º 123») y registra `anonymized_at`.
  - Se conservan las mascotas, las consultas y las recetas, que deben guardarse como respaldo clínico y en el caso de fármacos controlados.
  - «Revocar contacto» solo detiene las comunicaciones.

**Migraciones** (con `/create-migration`, idempotentes, probadas dentro de `BEGIN … ROLLBACK` y aplicadas en producción solo con confirmación)
- **019_owners:**
  - crea la tabla y `pets.owner_id`;
  - normaliza el RUT y el teléfono de los datos existentes;
  - rellena agrupando por organización y RUT canónico (luego correo, teléfono y nombre);
  - genera un informe para revisar a mano las mascotas actuales sin RUT y completarlo.
- **020_vaccinations:** tabla y relleno desde los `clinical_records` de tipo `vacuna` (el texto antiguo de `pets.vaccines` queda como nota).
- **021_pet_status_alerts_weight:** estado, especie «otra», alertas, registro, `weight_kg` y el caché de peso, rellenados desde el último peso conocido.
- **022_drop_pet_tutor_columns:** en la fase 3, tras una semana sin lecturas de esas columnas.

**API** (con rewrite en `vercel.json` y `check:schema` actualizado)
- `/items/owners`: CRUD, `GET /items/owners/check?rut=` para duplicados, `POST /items/owners/:id/anonymize` y `/revoke-contact`.
- `/items/owners/:id/pets` y `/items/vaccinations`, con `GET /items/vaccinations/products` para el autocompletado.
- `/search`: une mascotas y tutores; reconoce un RUT o un teléfono en cualquier formato.
- `PET_SELECT`: une los datos del tutor; durante la transición escribe en ambos lados para no romper los PDF ni los recordatorios.

## 5. Flujos

**A. Encontrar o registrar** (pestaña Pacientes)
- **Búsqueda** única arriba, por nombre de la mascota, RUT (con o sin puntos), teléfono, nombre del tutor o microchip.
- **Selector Mascotas | Tutores**, con Mascotas por defecto.
- **«Nuevo tutor»** abre una hoja con RUT (obligatorio), nombre, teléfono, correo, dirección, preferencia de contacto y otro contacto opcional.
  - Si el RUT ya existe, aparece «Este tutor ya está registrado: abrir ficha».
  - Al guardar se abre la ficha del tutor con «Agregar mascota» destacado.
- **Ficha del tutor:**
  - contacto con acciones (llamar, WhatsApp, correo);
  - mascotas con escudo, especie, edad, estado de vacunas y estado de vida;
  - próximas citas, saldo y consentimiento de comunicaciones;
  - en un menú secundario, «Revocar contacto» y «Anonimizar datos».

**B. Agregar mascota** (el tutor ya viene dado; una pantalla)
- **Identidad:**
  - nombre;
  - especie: Perro, Gato u **Otra** (abre un campo libre: conejo, hurón, ave…);
  - raza con autocompletado para perro y gato;
  - sexo y estado reproductivo;
  - fecha de nacimiento **o edad aproximada** (queda marcada como estimada);
  - color, foto, microchip y n.º de registro.
- **Salud declarada** (plegada): alergias, enfermedades previas, medicación actual, temperamento y vacunas previas (con el plan base y fecha; quedan en `vaccinations`).
- **Al guardar:** «Iniciar primera consulta», «Agendar» o «Solo registrar», y «Agregar otro de la misma camada».

**C. Agenda y recepción**
- **Agendar:** una cita se puede crear con solo nombre y teléfono, buscando primero si ya hay ficha.
- **Al llegar el paciente** («en recepción»), la cita pide vincularse a una mascota. El **alta rápida** se hace en ese momento: RUT del tutor (si existe, se usa), nombre de la mascota y especie; el resto se completa después.

**D. Ficha del paciente**
- **Encabezado fijo:** escudo o foto, nombre, especie, raza, edad, sexo, tutor (enlace), estado si no está activo y **alertas** (alergias, «puede morder», crónicas).
- **Franja de estado:**
  - peso actual (último de consulta, con fecha y tendencia);
  - vacunas (al día, próxima o vencida);
  - desparasitación;
  - próxima cita y saldo.
- **Acciones:** «Nueva consulta» como principal; vacuna, receta, cita, examen y cobro como secundarias. Sin botón «Signos».
- **Secciones:**
  - **Resumen:** última consulta, problemas activos, medicación.
  - **Historial:** una línea de tiempo filtrable con consultas, vacunas, recetas, exámenes, hospitalizaciones, citas y pagos.
  - **Vacunas y prevención:** plan, próximas fechas, aplicar dosis y certificado.
  - **Documentos.**

**E. Consulta** (una pantalla)
- **Inicio:** desde la cita o la ficha. La primera consulta trae la plantilla de anamnesis inicial; las siguientes copian la última anamnesis como base editable.
- **Bloques:**
  - motivo y anamnesis;
  - **peso** (un campo; actualiza la ficha);
  - **hallazgos del examen** (texto libre, con dictado);
  - diagnóstico con buscador del catálogo de enfermedades;
  - plan.
- **Desde el plan:**
  - receta, con dosis sugerida según el último peso y el vademécum;
  - vacuna aplicada, con el producto autocompletado y la próxima fecha calculada;
  - examen;
  - control (cita de seguimiento);
  - cobro.
- **Al cerrar:** se genera el resumen para el tutor y la cita queda «atendida».

**Plan base de vacunas** (los intervalos son editables por la clínica)
- **Perro:**
  - **Óctuple/Séxtuple:** serie de cachorro cada 3-4 semanas hasta las 16 semanas o más, refuerzo a los 6-12 meses y luego según el producto.
  - **KC:** anual.
  - **Antirrábica:** anual. Es la práctica habitual en Chile; confirmar la exigencia vigente.
- **Gato:**
  - **Triple Felina:** serie de gatito y refuerzos según riesgo.
  - **Leucemia Felina:** gatos con acceso al exterior y FeLV negativos.
  - **Antirrábica:** anual.
- **Próxima dosis:** al aplicar una dosis, la fecha siguiente se propone con el intervalo del plan y se puede editar. El recordatorio se programa solo si la mascota está activa y el tutor tiene el contacto vigente.

## 6. Innovaciones (priorizadas)

| Prioridad | Idea | Por qué |
|---|---|---|
| Alta | Búsqueda universal con RUT y teléfono canónicos y detección de duplicados | Es lo que más tiempo ahorra en recepción |
| Alta | Alertas siempre visibles (también en la agenda) | Seguridad del paciente y del personal |
| Alta | Plan de vacunas con próxima fecha y recordatorio automático, respetando el estado de vida | Hoy se infiere de texto; evita avisos a mascotas fallecidas |
| Alta | Consulta continua (peso, receta, vacuna, control y cobro en un flujo) | Elimina los modales sueltos |
| Alta | Peso con un solo origen y dosis sugerida según el último peso | Menos errores de dosificación |
| Media | Edad aproximada, «otro de la misma camada», especie «Otra» | Altas más rápidas y realistas |
| Media | Resumen de consulta y certificado de vacunas en PDF o correo | Valor visible para el tutor |
| Media | Plantillas de consulta (vacunación, control posoperatorio, cachorro) | Menos escritura repetida |
| Fuera | Pre-registro en línea, cotutores | Decidido por el usuario |

## 7. Fases (cada una con commit, push y verificación)

**Fase 0. Prototipo** (sin migraciones)
- Pantallas navegables de Pacientes (selector y búsqueda), ficha del tutor, agregar mascota, ficha nueva y consulta, con datos de ejemplo.
- Revisión con capturas y crítica de las skills impeccable y taste antes de tocar la base.

**Fase 1. Modelo y API**
- Normalización de RUT y teléfono, migraciones 019 a 021, escritura en ambos lados y endpoints.
- Reglas de ciclo de vida en el generador de recordatorios y `check:schema` actualizado.
- Pruebas en transacción, incluidos los duplicados con distintos formatos de RUT y teléfono.

**Fase 2. Pacientes, tutores y alta**
- Selector Mascotas | Tutores, búsqueda universal, ficha del tutor, agregar mascota y alta rápida en recepción.
- Cita sin mascota permitida solo mientras está «agendada».
- Retirar el asistente de 4 pasos.

**Fase 3. Ficha y consulta**
- Encabezado con alertas, franja de estado, línea de tiempo, vacunas y prevención, y consulta continua con peso.
- Retirar el formulario de signos vitales.
- Migración 022.

**Fase 4. Extras**
- Resumen y certificado en PDF, plantillas de consulta, anonimización y revocación de contacto en la interfaz.

**Verificación en cada fase:**
- `npm run typecheck`, `npm run check:schema` y lint de taste.
- Sandbox (producción dentro de una transacción) en escritorio, teléfono y Alter.
- Flujo completo: cita por teléfono sin ficha → llegada con alta rápida → primera consulta con peso, receta y vacuna → recordatorio generado → la mascota se marca fallecida → el recordatorio queda cancelado.

## 8. Riesgos

- **PDF y recordatorios:** dependen hoy de los campos del tutor en `pets`. Se mitiga escribiendo en ambos lados y leyendo del tutor con alternativa hasta la fase 3.
- **RUT obligatorio con datos antiguos:** si una mascota existente no tiene RUT, la migración la deja con un tutor «pendiente de RUT» y se completa a mano (con 7 registros se resuelve en minutos).
- **Retirar los signos vitales:** las mediciones antiguas se conservan en el historial en solo lectura, sin pérdida de datos.
- **Alcance:** las fases son independientes y desplegables por separado.

## 9. Pendiente de confirmar

- Si la clínica pone la antirrábica cada año o según el producto.

## 10. Catálogo de enfermedades: 200 fichas, orden por frecuencia en Chile y nueva pestaña

### 10.1 Por qué el orden actual se siente raro (evidencia)

- **El orden no es por frecuencia.** «Más frecuentes» ordena primero por especie («perro y gato», luego perro, luego gato) y solo después por `prevalence_rank` (`server.js`, `GET /items/diseases`).
- **Las prioridades no se comparan entre sí.** `prevalence_rank` se asignó por lotes: hay valores repetidos entre perro y gato, y no son comparables entre fichas de distintas fuentes.
- **Grupos por edad delante.** La pantalla antepone los grupos «Cachorros» y «Gatitos», así que lo primero que se ve son enfermedades pediátricas, no las más comunes.
- **Tarjetas desparejas.** La grilla de 3 columnas tiene tarjetas de alturas distintas (agente, signos, sello de zoonosis); el sello de gravedad compite con el nombre, y hay que leer tres líneas para saber si una ficha sirve.

### 10.2 Orden por frecuencia en Chile

- **Campos nuevos** (migración 023):
  - `chile_frequency` ('muy_frecuente' | 'frecuente' | 'ocasional' | 'rara'), un nivel legible para el veterinario;
  - `chile_rank`, un entero único para ordenar dentro de cada nivel;
  - `chile_frequency_basis`, con la fuente o el criterio de cada asignación.
- **Asignación inicial:**
  - **Primero:** literatura chilena (estudios de causas de consulta en clínicas de pequeños animales, vigilancia del ISP y del SAG, estudios regionales de parásitos y vectores).
  - **Si falta evidencia local:** prevalencia internacional ajustada al contexto chileno (por ejemplo, la leishmaniasis queda «rara» por ser importada; la ehrlichiosis, «frecuente» en el norte y la zona central).
  - **Registro:** cada nivel guarda su fuente en `chile_frequency_basis`. No se publican cifras de prevalencia sin una fuente que las respalde.
- **Ajuste con los datos de la propia clínica:** cuando la consulta nueva (fase 3) enlace el diagnóstico a una ficha del catálogo, el orden puede incorporar la frecuencia real de diagnósticos de la organización («Más vistas en tu clínica») además del orden nacional.
- **Servidor:** se ordena por `chile_rank` sin anteponer la especie; el filtro Perro/Gato sigue funcionando igual.

### 10.3 Ampliación a 200 fichas (50 nuevas)

**Criterios:**
- frecuencia en la práctica chilena;
- importancia clínica (urgencias, zoonosis);
- huecos del catálogo actual.

**Formato:** el mismo de las anteriores: secciones completas, «En Chile» donde cambie la conducta, referencias actuales (guías posteriores a 2015 salvo estudios base) y la nota de borrador hasta la revisión veterinaria.

**Contexto clínico:** se usan los libros de la carpeta Libros (Greene's 5.ª, Plumb's 10.ª para dosis, Small Animal Surgery 5.ª, Breed Predispositions 3.ª, Medicina interna en pequeños animales).

**Pedidas expresamente**
1. Síndrome de cauda equina (estenosis lumbosacra degenerativa), perro y **gato**: en el gato es menos frecuente y se confunde con dolor de cadera o de cola.
2. Estomatitis ulcerativa crónica canina (CUPS, estomatitis paradental ulcerativa crónica).

**Muy frecuentes en consulta y hoy ausentes**
3. Gastroenteritis aguda por indiscreción alimentaria
4. Colitis aguda
5. Dermatitis acral por lamido
6. Miasis cutánea (frecuente en verano y en perros de zonas rurales)
7. Picadura de abeja o avispa y anafilaxia
8. Heridas por mordedura en perros
9. Síndrome del gato paracaidista (caídas desde altura; departamentos urbanos)
10. Otitis media e interna
11. Coccidiosis (Cystoisospora) en cachorros y gatitos
12. Complejo granuloma eosinofílico felino
13. Hiperplasia prostática benigna
14. Mastitis
15. Metritis posparto
16. Hernia umbilical e inguinal

**Intoxicaciones relevantes en Chile**
17. Intoxicación por cannabis (THC)
18. Intoxicación por etilenglicol (anticongelante)
19. Intoxicación por ivermectina en razas con mutación MDR1/ABCB1
20. Intoxicación por estricnina (envenenamientos intencionales)
21. Intoxicación por cebolla y ajo
22. Intoxicación por cloro y productos de limpieza

**Neurología y ortopedia**
23. Meningitis-arteritis que responde a corticoides
24. Meningoencefalitis de origen desconocido
25. Síndrome de disfunción cognitiva canina
26. Espondilomielopatía cervical (síndrome de Wobbler)
27. Displasia de codo
28. Enfermedad de Legg-Calvé-Perthes
29. Panosteítis
30. Osteocondritis disecante
31. Parálisis laríngea
32. Megaesófago canino

**Medicina interna y oncología**
33. Hepatitis crónica canina
34. Bronquitis crónica canina
35. Insulinoma canino
36. Acromegalia felina
37. Hiperaldosteronismo primario felino
38. Carcinoma de sacos anales
39. Carcinoma urotelial (de células transicionales) de vejiga
40. Sarcoma de tejidos blandos canino
41. Tumores testiculares
42. Hernia diafragmática traumática
43. Intususcepción intestinal

**Oftalmología y dermatología**
44. Uveítis
45. Luxación del cristalino
46. Atrofia progresiva de retina
47. Entropión
48. Secuestro corneal felino
49. Pénfigo foliáceo
50. Sarna notoédrica felina

La lista se puede ajustar antes de escribir las fichas; cada una se valida igual que las 56 anteriores (estructura completa, sin precios, al menos 2 referencias) y se aplica con confirmación.

### 10.4 Rediseño de la pestaña Enfermedades

Modo Read y Operate (impeccable), con las reglas de la casa de taste: sin tarjetas de ícono, sin píldoras, sin bordes en reposo.

- **Lista en lugar de tarjetas.** Filas de altura pareja que se leen en una línea:
  - marca de nivel de frecuencia (rombo lleno, medio o vacío);
  - nombre de la enfermedad;
  - especie;
  - categoría;
  - gravedad como sello pequeño a la derecha.
  - El agente y los signos aparecen al pasar el cursor o en el panel de vista previa, no en la fila.
- **Agrupada por frecuencia en Chile.** Se agrupa en «Muy frecuentes», «Frecuentes», «Ocasionales» y «Raras», en ese orden, con el número de fichas de cada grupo. Los grupos «Cachorros» y «Gatitos» desaparecen; la edad pasa a ser un filtro más.
- **Vista maestro-detalle en escritorio:** al elegir una enfermedad, su ficha (el rediseño ya hecho) se abre en un panel a la derecha sin perder la lista ni los filtros. En el teléfono se abre la ficha completa.
- **Búsqueda** primero y con foco al entrar: por nombre en español o inglés, agente, signo o sinónimo. Los resultados resaltan la coincidencia.
- **Filtros en una barra:**
  - especie (Todas, Perro, Gato);
  - categoría;
  - gravedad;
  - edad;
  - zoonótica;
  - «Urgencias», que muestra solo las fichas con protocolo de urgencia, útil a la llegada de un paciente grave.
- **Orden:** «Frecuencia en Chile» (por defecto), «Más vistas en tu clínica» (cuando haya datos), «A–Z» y «Gravedad».
- **Accesos directos:** «Recientes» y «Favoritas» arriba de la lista (los favoritos ya existen).
- **Desde la consulta:** el buscador de diagnóstico de la consulta usa el mismo componente de lista, para que buscar una enfermedad sea igual en todas partes.

### 10.5 Fases de este bloque (paralelas a las de pacientes)

**Fase E1. Orden y pestaña**
- Migración 023 y asignación inicial de la frecuencia en Chile, con fuente por ficha y revisión tuya antes de aplicar.
- Orden del servidor por `chile_rank`.
- Nueva pestaña Enfermedades: lista, grupos por frecuencia, vista maestro-detalle y filtro de urgencias.
- Capturas en escritorio, teléfono y Alter.

**Fase E2. 50 fichas nuevas**
- Redacción en lotes de 10 a 15, con prueba en seco y validación automática.
- Revisión de dosis contra Plumb's 10.ª y aplicación con confirmación.
- Total esperado: 200.

**Fase E3. Integración con la consulta**
- Diagnóstico enlazado al catálogo en la consulta nueva (fase 3 de pacientes).
- Orden «Más vistas en tu clínica».
