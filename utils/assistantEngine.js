// Vet Assistant Engine — processes vet queries, queries DB, returns structured responses

const CLINIC_TZ = 'America/Santiago';

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Whole-word matcher that works with accents (\b treats "á" as a non-word char).
// An entry ending in "*" matches as a prefix ("vacun*" → vacuna, vacunación…).
function wordsRe(words) {
  const alts = words.map((w) => (w.endsWith('*') ? `${escapeRe(w.slice(0, -1))}[\\p{L}\\p{N}]*` : escapeRe(w)));
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${alts.join('|')})(?![\\p{L}\\p{N}])`, 'iu');
}

const RE = {
  dosis: wordsRe(['dosis', 'dosificación', 'dosificacion', 'cuánto dar', 'cuanto dar', 'cuántos mg', 'cuantos mg']),
  hoy: wordsRe(['hoy', 'qué tengo', 'que tengo', 'agenda del día', 'agenda del dia', 'mis citas', 'resumen del día', 'resumen del dia']),
  vacuna: wordsRe(['vacun*', 'refuerzo*']),
  protocolo: wordsRe(['esquema*', 'protocolo*', 'cachorro*', 'gatito*', 'kitten', 'calendario']),
  receta: wordsRe(['receta', 'recetar', 'prescribir', 'prescripción', 'prescripcion']),
  buscar: wordsRe(['buscar', 'busca', 'busque', 'paciente', 'mascota']),
  ayuda: wordsRe(['ayuda', 'help', 'qué puedes', 'que puedes', 'capacidades', 'funciones', 'comandos']),
  saludo: wordsRe(['hola', 'buenas', 'buenos días', 'buenos dias', 'buenas tardes', 'buenas noches', 'hello', 'hi']),
  perro: wordsRe(['perro*', 'canin*', 'cachorro*', 'puppy']),
  gato: wordsRe(['gato*', 'gatito*', 'felin*', 'kitten']),
};

// Disease keyword → name fragment used to find it in the disease list
const DISEASE_KEYWORDS = {
  'parvovirus': ['parvovirus', 'parvo'],
  'moquillo': ['moquillo'],
  'leishmaniasis': ['leishmaniasis', 'leishmania'],
  'leptospirosis': ['leptospirosis', 'lepto'],
  'rabia': ['rabia'],
  'bordetella': ['bordetella', 'tos de las perreras'],
  'ehrlichiosis': ['ehrlichiosis', 'ehrlichia'],
  'anaplasmosis': ['anaplasmosis', 'anaplasma'],
  'babesiosis': ['babesiosis', 'babesia'],
  'dermatofitosis': ['dermatofitosis', 'tiña'],
  'atopía': ['atopía', 'atopia', 'dermatitis atópica'],
  'diabetes': ['diabetes'],
  'pancreatitis': ['pancreatitis'],
  'linfoma': ['linfoma'],
  'cushing': ['cushing', 'hiperadrenocorticismo'],
  'hipotiroidismo': ['hipotiroidismo'],
  'hiperparatiroidismo': ['hiperparatiroidismo'],
  'ivdd': ['ivdd', 'hernia discal', 'discopatía'],
  'luxación': ['luxación patelar', 'luxación', 'luxacion'],
  'displasia': ['displasia'],
  'osteoartritis': ['osteoartritis'],
  'fip': ['fip', 'peritonitis infecciosa'],
  'calicivirus': ['calicivirus'],
  'herpesvirus': ['herpesvirus', 'rinotraqueítis', 'rinotraqueitis'],
  'panleucopenia': ['panleucopenia'],
  'felv': ['felv', 'leucemia felina'],
  'fiv': ['fiv', 'inmunodeficiencia felina'],
  'asma': ['asma', 'asthma'],
  'cardiomiopatía': ['cardiomiopatía', 'cardiomiopatia', 'hipertrófica', 'hipertrofica', 'dcm', 'hcm'],
  'renal crónica': ['renal crónica', 'renal cronica', 'enfermedad renal', 'irc', 'renal'],
  'obstrucción': ['obstrucción', 'obstruccion'],
  'intoxicación': ['intoxicación', 'intoxicacion', 'envenenamiento', 'rodenticida'],
  'otitis': ['otitis'],
  'periodontal': ['periodontal', 'enfermedad periodontal'],
  'forl': ['forl', 'lesión odontoclástica'],
  'flutd': ['flutd', 'síndrome urinario felino'],
  'cistitis': ['cistitis'],
  'toxoplasmosis': ['toxoplasmosis', 'toxoplasma'],
};
const DISEASE_RE = Object.entries(DISEASE_KEYWORDS).map(([key, kws]) => [key, wordsRe(kws)]);

// Longest first so "amoxicilina/clavulanico" wins over "amoxicilina"
const DRUG_KEYWORDS = [
  'amoxicilina', 'amoxicilina/clavulanico', 'clavamox', 'cefalexina', 'metronidazol',
  'doxiciclina', 'enrofloxacina', 'marbofloxacina', 'trimetroprim', 'sulfametoxazol',
  'meloxicam', 'carprofeno', 'firocoxib', 'piroxicam', 'paracetamol', 'tramadol',
  'gabapentina', 'pregabalina', 'prednisolona', 'prednisona', 'dexametasona',
  'acetato de metilprednisolona', 'ciclosporina', 'azatioprina', 'metotrexato',
  'insulina', 'levotiroxina', 'metimazol', 'fenobarbital', 'bromuro de potasio',
  'furosemida', 'benazepril', 'enalapril', 'espironolactona', 'clopidogrel',
  'ranitidina', 'omeprazol', 'maropitant', 'cerenia', 'metoclopramida',
  'lactulosa', 'loperamida', 'sucralfato', 'misoprostol',
].sort((a, b) => b.length - a.length);

const SEARCH_STOPWORDS = new Set([
  'buscar', 'busca', 'busque', 'paciente', 'pacientes', 'mascota', 'mascotas',
  'el', 'la', 'los', 'las', 'un', 'una', 'al', 'del', 'a', 'de', 'por', 'favor', 'mi', 'mis',
]);

const likePattern = (s) => `%${s.replace(/[\\%_]/g, '\\$&')}%`;

// Intent detection — order matters: the more specific intents go first
function detectIntent(message) {
  const m = message.toLowerCase().trim();

  if (RE.dosis.test(m)) return 'dosificacion';
  if (RE.vacuna.test(m) && RE.protocolo.test(m)) return 'protocolo_vacunacion';
  if (RE.vacuna.test(m)) return 'vacunas_pendientes';
  if (RE.hoy.test(m)) return 'resumen_dia';
  if (RE.receta.test(m)) return 'receta_rapida';
  if (DISEASE_RE.some(([, re]) => re.test(m)) && !RE.buscar.test(m)) return 'enfermedad';
  if (RE.buscar.test(m)) return 'buscar_paciente';
  if (RE.ayuda.test(m)) return 'ayuda';
  if (RE.saludo.test(m)) return 'saludo';
  return 'otro';
}

// Process message and generate response (runs on server with DB access)
async function processAssistantMessage(message, userId, pool, diseases, vaccinations) {
  const intent = detectIntent(message);
  const m = message.toLowerCase().trim();

  switch (intent) {
    case 'buscar_paciente': {
      const search = message.trim().split(/\s+/).filter((t) => !SEARCH_STOPWORDS.has(t.toLowerCase())).join(' ');
      if (!search) {
        return { intent, text: '¿Qué paciente quieres buscar? Escribe el nombre.' };
      }
      const result = await pool.query(
        `SELECT id, name, species, breed, birth_date, weight, color, sex, tutor_name, phone, email,
                allergies, medications, vaccines, deworming, reproductive_status, status
         FROM pets WHERE user_id = $1 AND name ILIKE $2 ORDER BY name LIMIT 20`,
        [userId, likePattern(search)]
      );
      if (!result.rows.length) {
        return { intent, text: `No encontré pacientes con el nombre "${search}".` };
      }
      if (result.rows.length === 1) {
        const p = result.rows[0];
        const age = p.birth_date ? calcAge(p.birth_date) : 'N/D';
        const sexLabel = p.sex === 'macho' ? 'Macho' : p.sex === 'hembra' ? 'Hembra' : 'N/D';
        const allergies = p.allergies?.length ? p.allergies.join(', ') : 'Ninguna';
        const meds = p.medications || 'Ninguna';

        const lastRecord = await pool.query(
          `SELECT record_type, date FROM clinical_records WHERE pet_id = $1 ORDER BY date DESC LIMIT 1`,
          [p.id]
        );
        const lastVisit = lastRecord.rows[0]
          ? `${formatDate(lastRecord.rows[0].date)} (${lastRecord.rows[0].record_type})`
          : 'Sin registros';

        return {
          intent,
          text: `${p.name} — ${p.species === 'dog' ? 'Canino' : 'Felino'}, ${p.breed || 'N/D'}\nEdad: ${age} · Sexo: ${sexLabel} · Peso: ${p.weight || 'N/D'} kg\nAlergias: ${allergies}\nMedicación: ${meds}\nÚltima visita: ${lastVisit}\nTutor: ${p.tutor_name || 'N/D'} · Tel: ${p.phone || 'N/D'}`,
          actions: [
            { label: 'Ver ficha', action: 'view_history', payload: { petId: p.id } },
            { label: 'Crear receta', action: 'create_rx', payload: { petId: p.id, petName: p.name } },
            { label: 'Agendar cita', action: 'create_appointment', payload: { petName: p.name } },
          ],
          data: { pet: p },
        };
      }
      const list = result.rows.map((p) => `• ${p.name} — ${p.species === 'dog' ? 'Canino' : 'Felino'}, ${p.breed || 'N/D'}`).join('\n');
      return {
        intent,
        text: `Encontré ${result.rows.length} pacientes:\n${list}\n\nEscribe el nombre exacto para ver el detalle.`,
      };
    }

    case 'dosificacion': {
      const drugFound = DRUG_KEYWORDS.find((drug) => m.includes(drug)) || '';
      if (!drugFound) {
        return {
          intent,
          text: '¿Qué medicamento necesitas? Ejemplo: "dosis amoxicilina perro 15 kg"',
          actions: [
            { label: 'Ejemplo con amoxicilina', action: 'list_drugs' },
          ],
        };
      }

      const weightMatch = m.match(/(\d+(?:[.,]\d+)?)\s*(?:kg|kilo|kilos)(?![\p{L}])/u);
      const weight = weightMatch ? parseFloat(weightMatch[1].replace(',', '.')) : null;

      const dosages = [];
      for (const d of diseases) {
        for (const line of [...(d.treatment?.firstLine || []), ...(d.treatment?.secondLine || [])]) {
          if (line.toLowerCase().includes(drugFound)) dosages.push(`[${d.name}] ${line}`);
        }
      }

      if (dosages.length) {
        let response = `Dosificaciones de ${drugFound}:\n\n`;
        response += dosages.slice(0, 5).join('\n\n');
        if (weight) {
          response += `\n\nPara un paciente de ${weight.toLocaleString('es-CL')} kg, calcula la dosis según el protocolo (o usa la calculadora de dosis).`;
        }
        return { intent, text: response, data: { drug: drugFound, dosages } };
      }

      return {
        intent,
        text: `No encontré dosificaciones para "${drugFound}" en la base de enfermedades. Consulta una referencia farmacológica actualizada.`,
      };
    }

    case 'resumen_dia': {
      const [appts, reminders, lowStock] = await Promise.all([
        pool.query(
          `SELECT id, patient_name, start_time, appointment_type FROM appointments
           WHERE user_id = $1 AND (start_time AT TIME ZONE $2)::date = (NOW() AT TIME ZONE $2)::date
             AND status NOT IN ('cancelada')
           ORDER BY start_time`,
          [userId, CLINIC_TZ]
        ),
        pool.query(
          `SELECT r.title, p.name AS pet_name FROM reminders r JOIN pets p ON p.id = r.pet_id
           WHERE r.user_id = $1 AND r.status = 'pending'
             AND (r.scheduled_for AT TIME ZONE $2)::date <= (NOW() AT TIME ZONE $2)::date
           ORDER BY r.scheduled_for LIMIT 5`,
          [userId, CLINIC_TZ]
        ),
        pool.query(
          `SELECT name, current_stock, min_stock, unit FROM inventory WHERE user_id = $1 AND current_stock <= min_stock`,
          [userId]
        ),
      ]);

      const todayLabel = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: CLINIC_TZ });
      let response = `Resumen del día — ${todayLabel}\n\n`;

      if (appts.rows.length) {
        response += `Citas (${appts.rows.length}):\n`;
        for (const a of appts.rows) {
          const time = new Date(a.start_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: CLINIC_TZ });
          response += `  ${time} — ${a.patient_name} (${a.appointment_type})\n`;
        }
      } else {
        response += 'Sin citas hoy.\n';
      }

      if (reminders.rows.length) {
        response += `\nRecordatorios pendientes (${reminders.rows.length}):\n`;
        for (const r of reminders.rows) {
          response += `  • ${r.title} — ${r.pet_name}\n`;
        }
      }

      if (lowStock.rows.length) {
        response += `\nStock bajo (${lowStock.rows.length}):\n`;
        for (const i of lowStock.rows) {
          response += `  • ${i.name}: ${i.current_stock} ${i.unit || ''} (mín.: ${i.min_stock})\n`;
        }
      }

      if (!appts.rows.length && !reminders.rows.length && !lowStock.rows.length) {
        response += 'Todo al día, sin pendientes.';
      }

      return { intent, text: response.trimEnd() };
    }

    case 'vacunas_pendientes': {
      // Latest vaccine per living patient in one query
      const result = await pool.query(
        `SELECT p.id, p.name, v.date, v.details
         FROM pets p
         LEFT JOIN LATERAL (
           SELECT date, details FROM clinical_records cr
           WHERE cr.pet_id = p.id AND cr.record_type = 'vacuna'
           ORDER BY date DESC LIMIT 1
         ) v ON TRUE
         WHERE p.user_id = $1 AND COALESCE(p.status, 'alive') = 'alive'
           AND (v.date IS NULL OR v.date < NOW() - INTERVAL '11 months')
         ORDER BY v.date NULLS FIRST, p.name`,
        [userId]
      );
      const pending = result.rows.map((r) => ({
        petId: r.id,
        pet: r.name,
        lastVaccine: r.date ? (r.details?.notes?.split('\n')[0] || 'Vacuna') : 'Sin vacunas registradas',
        lastDate: r.date ? formatDate(r.date) : 'N/D',
      }));

      if (!pending.length) {
        return { intent, text: 'Todos los pacientes tienen sus vacunas al día.' };
      }

      let response = `Pacientes con vacunas pendientes o vencidas (${pending.length}):\n\n`;
      for (const p of pending.slice(0, 20)) {
        response += `• ${p.pet} — Última: ${p.lastVaccine} (${p.lastDate})\n`;
      }
      if (pending.length > 20) response += `…y ${pending.length - 20} más.\n`;
      response += '\nConsidera agendar refuerzos.';

      return {
        intent,
        text: response,
        actions: pending.slice(0, 4).map((p) => ({
          label: `Recordatorio: ${p.pet}`,
          action: 'create_reminder',
          payload: { petId: p.petId, petName: p.pet },
        })),
      };
    }

    case 'protocolo_vacunacion': {
      const isDog = RE.perro.test(m);
      const isCat = RE.gato.test(m);
      const species = isDog ? 'dog' : isCat ? 'cat' : null;

      if (!species) {
        return {
          intent,
          text: '¿Para qué especie? Ejemplo: "esquema vacunación cachorro" (perro) o "esquema vacunación gatito" (gato)',
        };
      }

      const protocols = vaccinations[species] || [];
      let response = `Esquema de vacunación — ${species === 'dog' ? 'Canino' : 'Felino'}\n\n`;
      for (const proto of protocols) {
        response += `${proto.name}:\n`;
        for (const step of proto.schedule) {
          response += `  • ${step.age}: ${typeof step.dose === 'number' ? `dosis ${step.dose}` : step.dose}\n`;
        }
        response += '\n';
      }

      return { intent, text: response.trimEnd() };
    }

    case 'enfermedad': {
      let foundDisease = null;
      for (const [key, re] of DISEASE_RE) {
        if (!re.test(m)) continue;
        foundDisease = diseases.find((d) => d.name.toLowerCase().includes(key) || String(d.id).toLowerCase().includes(key));
        if (foundDisease) break;
      }

      if (!foundDisease) {
        return { intent, text: 'No encontré esa enfermedad en la base de datos. Escribe el nombre exacto.' };
      }

      const d = foundDisease;
      let response = d.name;
      if (d.scientific_name) response += ` (${d.scientific_name})`;
      if (d.description) response += `\n\n${d.description}`;
      response += '\n\n';

      if (d.key_signs?.length) {
        response += `Signos clave:\n${d.key_signs.map((s) => `  • ${s}`).join('\n')}\n\n`;
      }

      if (d.treatment?.firstLine?.length) {
        response += `Tratamiento de primera línea:\n${d.treatment.firstLine.map((t) => `  • ${t}`).join('\n')}\n\n`;
      }

      if (d.treatment?.emergency) {
        response += `Emergencia:\n  ${d.treatment.emergency}\n\n`;
      }

      response += `Duración: ${d.treatment?.duration || 'N/D'}\n`;
      response += `Pronóstico: ${d.prognosis || 'N/D'}`;
      if (d.is_zoonotic) response += '\nZoonosis: riesgo de transmisión a personas.';

      return {
        intent,
        text: response,
        actions: [
          { label: 'Ver detalle completo', action: 'view_disease', payload: { diseaseId: d.id } },
          { label: 'Crear nota clínica', action: 'create_note', payload: { diseaseName: d.name } },
        ],
        data: { disease: d },
      };
    }

    case 'receta_rapida': {
      // "receta para Rocky: amoxicilina 500 mg cada 12 h" — the patient goes before the colon
      const text = message.trim();
      const colon = text.indexOf(':');
      const head = colon >= 0 ? text.slice(0, colon) : text;
      const petMatch = head.match(/(?<![\p{L}\p{N}])(?:para|a)\s+([\p{L}\p{N}][\p{L}\p{N}' -]*)/iu);
      let petName = petMatch ? petMatch[1].trim() : null;
      let rxBody = colon >= 0
        ? text.slice(colon + 1).trim()
        : text.replace(/(?<![\p{L}])(?:receta|recetar|prescribir|prescripci[oó]n)(?![\p{L}])/giu, '').trim();

      // Without a colon the name and the drugs run together: keep only the first word as the name
      if (colon < 0 && petName) {
        petName = petName.split(/\s+/)[0];
        rxBody = rxBody.replace(new RegExp(`^(?:para|a)\\s+${escapeRe(petName)}\\s*`, 'iu'), '').trim();
      }

      if (!rxBody) {
        return {
          intent,
          text: 'Escribe la receta. Ejemplo: "receta para Rocky: amoxicilina 500 mg cada 12 h por 7 días"',
        };
      }
      if (!petName) {
        return {
          intent,
          text: `Borrador de receta:\n\n${rxBody}\n\n¿Para qué paciente es? Ejemplo: "receta para Rocky: ${rxBody}"`,
        };
      }

      const pets = await pool.query(
        `SELECT id, name FROM pets WHERE user_id = $1 AND name ILIKE $2 AND COALESCE(status, 'alive') = 'alive' ORDER BY name LIMIT 5`,
        [userId, petName.replace(/[\\%_]/g, '\\$&')]
      );
      if (pets.rows.length !== 1) {
        return {
          intent,
          text: pets.rows.length
            ? `Hay ${pets.rows.length} pacientes llamados "${petName}". Abre la ficha del correcto para crear la receta.`
            : `No encontré un paciente llamado "${petName}".`,
        };
      }
      const pet = pets.rows[0];

      return {
        intent,
        text: `Borrador de receta para ${pet.name}:\n\n${rxBody}\n\n¿Quieres guardarla en su ficha?`,
        actions: [
          { label: 'Guardar receta', action: 'save_rx', payload: { petId: pet.id, petName: pet.name, body: rxBody } },
          { label: 'Ver ficha', action: 'view_history', payload: { petId: pet.id } },
        ],
      };
    }

    case 'ayuda': {
      return {
        intent,
        text: 'Esto es lo que puedo hacer:\n\n• Buscar paciente — "buscar Rocky"\n• Dosificación — "dosis amoxicilina perro 15 kg"\n• Resumen del día — "qué tengo hoy"\n• Vacunas pendientes — "vacunas pendientes"\n• Esquemas — "esquema vacunación cachorro"\n• Enfermedades — "parvovirus"\n• Receta rápida — "receta para Rocky: amoxicilina 500 mg cada 12 h"\n\nEscribe tu consulta con tus palabras.',
      };
    }

    case 'saludo': {
      return {
        intent,
        text: 'Hola. ¿En qué te ayudo?',
        actions: [
          { label: 'Resumen del día', action: 'quick_query', payload: { query: 'qué tengo hoy' } },
          { label: 'Vacunas pendientes', action: 'quick_query', payload: { query: 'vacunas pendientes' } },
          { label: 'Qué puedo preguntar', action: 'quick_query', payload: { query: 'ayuda' } },
        ],
      };
    }

    default: {
      return {
        intent: 'otro',
        text: 'No entendí la consulta. Escribe "ayuda" para ver lo que puedo hacer.',
        actions: [
          { label: 'Ayuda', action: 'quick_query', payload: { query: 'ayuda' } },
        ],
      };
    }
  }
}

function calcAge(birthDate) {
  const bd = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - bd.getFullYear()) * 12 + (now.getMonth() - bd.getMonth());
  if (months < 1) return `${Math.floor((now.getTime() - bd.getTime()) / (7 * 24 * 60 * 60 * 1000))} sem`;
  if (months < 12) return `${months} mes${months > 1 ? 'es' : ''}`;
  const years = Math.floor(months / 12);
  return `${years} año${years > 1 ? 's' : ''}`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-CL', { timeZone: CLINIC_TZ });
}

module.exports = { detectIntent, processAssistantMessage };
