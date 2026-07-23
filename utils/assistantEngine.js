// Vet Assistant Engine — processes vet queries, queries DB, returns structured responses

// Intent detection
function detectIntent(message) {
  const m = message.toLowerCase().trim();

  if (/buscar|paciente|mascota|buscar a|buscar el|buscar la|buscar los|buscar las/.test(m)) return 'buscar_paciente';
  if (/dosis|dosificación|cuánto dar|cuanto dar|cuántos mg|cuantos mg|dame la dosis/.test(m)) return 'dosificacion';
  if (/hoy|qué tengo|que tengo|agenda del día|agenda del dia|mis citas|mis pacientes hoy/.test(m)) return 'resumen_dia';
  if (/vacuna|vacunas|refuerzo|refuerzos|vacunación|pendiente|pendientes/.test(m) && /vacuna|vacunas|refuerzo|refuerzos|vacunación/.test(m)) return 'vacunas_pendientes';
  if (/esquema|protocolo|protocolos|cachorro|kitten|calendario/.test(m) && /vacuna|vacun/.test(m)) return 'protocolo_vacunacion';
  if (/receta|prescribir|indicar|indicación/.test(m)) return 'receta_rapida';
  if (/ayuda|help|qué puedes|que puedes|capacidades|funciones|comandos/.test(m)) return 'ayuda';
  if (/hola|buenos días|buenas tardes|buenas noches|hello|hi/.test(m)) return 'saludo';

  // Disease lookup — check if message contains a known disease name
  const diseaseNames = [
    'parvovirus', 'moquillo', 'leishmaniasis', 'leptospirosis', 'rabia', 'bordetella',
    'ehrlichiosis', 'anaplasmosis', 'babesiosis', 'dermatofitosis', 'atopia', 'atopía',
    'diabetes', 'pancreatitis', 'linfoma', 'cushing', 'hipotiroidismo', 'hiperparatiroidismo',
    'ivdd', 'luxación', 'displasia', 'osteoartritis', 'peritonitis infecciosa', 'fip',
    'calicivirus', 'herpesvirus', 'panleucopenia', 'felv', 'fiv', 'asthma', 'asma',
    'cardiomiopatía', 'cardiomiopatia', 'hipertrofica', 'hipertrofia', 'renal', 'cronic',
    'obstrucción', 'obstruccion', 'intoxicación', 'intoxicacion', 'rodenticida',
    'otitis', 'periodontal', 'forl', 'flutd', 'cistitis', 'toxoplasmosis',
  ];
  for (const d of diseaseNames) {
    if (m.includes(d)) return 'enfermedad';
  }

  return 'otro';
}

// Process message and generate response (runs on server with DB access)
async function processAssistantMessage(message, userId, pool, diseases, vaccinations) {
  const intent = detectIntent(message);
  const m = message.toLowerCase().trim();

  switch (intent) {
    case 'buscar_paciente': {
      const search = m.replace(/buscar|paciente|mascota|el|la|los|las|un|una|al|del|a/g, '').trim();
      if (!search) {
        return { intent, text: '¿Qué paciente desea buscar? Escriba el nombre.' };
      }
      const result = await pool.query(
        `SELECT id, name, species, breed, birth_date, weight, color, sex, tutor_name, phone, email,
                allergies, medications, vaccines, deworming, reproductive_status, status
         FROM pets WHERE user_id = $1 AND name ILIKE $2 ORDER BY name`,
        [userId, `%${search}%`]
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
          `SELECT record_type, date, details FROM clinical_records WHERE pet_id = $1 ORDER BY date DESC LIMIT 1`,
          [p.id]
        );
        const lastVisit = lastRecord.rows[0]
          ? `${formatDate(lastRecord.rows[0].date)} (${lastRecord.rows[0].record_type})`
          : 'Sin registros';

        return {
          intent,
          text: `📋 ${p.name} — ${p.species === 'dog' ? 'Canino' : 'Felino'}, ${p.breed || 'N/D'}\nEdad: ${age} | Sexo: ${sexLabel} | Peso: ${p.weight || 'N/D'} kg\nAlergias: ${allergies}\nMedicación: ${meds}\nÚltima visita: ${lastVisit}\nTutor: ${p.tutor_name || 'N/D'} | Tel: ${p.phone || 'N/D'}`,
          actions: [
            { label: 'Ver historial', action: 'view_history', payload: { petId: p.id } },
            { label: 'Crear receta', action: 'create_rx', payload: { petId: p.id, petName: p.name } },
            { label: 'Agendar cita', action: 'create_appointment', payload: { petName: p.name } },
          ],
          data: { pet: p },
        };
      }
      const list = result.rows.map((p) => `• ${p.name} — ${p.species === 'dog' ? 'Canino' : 'Felino'}, ${p.breed || 'N/D'}`).join('\n');
      return {
        intent,
        text: `Encontré ${result.rows.length} pacientes:\n${list}\n\nEscriba el nombre exacto para ver detalles.`,
      };
    }

    case 'dosificacion': {
      const drugKeywords = [
        'amoxicilina', 'amoxicilina/clavulanico', 'clavamox', 'cefalexina', 'metronidazol',
        'doxiciclina', 'enrofloxacina', 'marbofloxacina', 'trimetroprim', 'sulfametoxazol',
        'meloxicam', 'carprofeno', 'firocoxib', 'piroxicam', 'paracetamol', 'tramadol',
        'gabapentina', 'pregabalina', 'prednisolona', 'prednisona', 'dexametasona',
        'acetato de metilprednisolona', 'ciclosporina', 'azatioprina', 'metotrexato',
        'insulina', 'levotiroxina', 'metimazol', 'fenobarbital', 'bromuro de potasio',
        'furosemida', 'benazepril', 'enalapril', 'espironolactona', 'clopidogrel',
        'ranitidina', 'omeprazol', 'maropitant', 'cerenia', 'metoclopramida',
        'lactulosa', 'loperamida', 'sucralfato', 'misoprostol',
      ];
      let drugFound = '';
      for (const drug of drugKeywords) {
        if (m.includes(drug)) { drugFound = drug; break; }
      }
      if (!drugFound) {
        return {
          intent,
          text: '¿Qué medicamento necesita? Ejemplo: "dosis amoxicilina perro 15kg"',
          actions: [
            { label: 'Ver lista de fármacos', action: 'list_drugs' },
          ],
        };
      }

      const weightMatch = m.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilos)/);
      const weight = weightMatch ? parseFloat(weightMatch[1]) : null;

      const dosages = [];
      for (const d of diseases) {
        if (d.treatment?.firstLine) {
          for (const line of d.treatment.firstLine) {
            if (line.toLowerCase().includes(drugFound)) {
              dosages.push(`[${d.name}] ${line}`);
            }
          }
        }
        if (d.treatment?.secondLine) {
          for (const line of d.treatment.secondLine) {
            if (line.toLowerCase().includes(drugFound)) {
              dosages.push(`[${d.name}] ${line}`);
            }
          }
        }
      }

      if (dosages.length) {
        let response = `💊 Dosificaciones de ${drugFound}:\n\n`;
        response += dosages.slice(0, 5).join('\n\n');
        if (weight) {
          response += `\n\n⚖️ Para paciente de ${weight} kg, calcule la dosis según el protocolo.`;
        }
        return { intent, text: response, data: { drug: drugFound, dosages } };
      }

      return {
        intent,
        text: `No encontré dosificaciones específicas para "${drugFound}" en la base de datos de enfermedades. Consulte referencias farmacológicas actualizadas.`,
      };
    }

    case 'resumen_dia': {
      const today = new Date().toISOString().slice(0, 10);
      const [appts, reminders, lowStock] = await Promise.all([
        pool.query(
          `SELECT id, patient_name, start_time, appointment_type, description FROM appointments WHERE user_id = $1 AND DATE(start_time) = $2 ORDER BY start_time`,
          [userId, today]
        ),
        pool.query(
          `SELECT r.*, p.name AS pet_name FROM reminders r JOIN pets p ON p.id = r.pet_id WHERE r.user_id = $1 AND r.status = 'pending' AND DATE(r.scheduled_for) <= $2 ORDER BY r.scheduled_for LIMIT 5`,
          [userId, today]
        ),
        pool.query(
          `SELECT name, current_stock, min_stock, unit FROM inventory WHERE user_id = $1 AND current_stock <= min_stock`,
          [userId]
        ),
      ]);

      let response = `📅 Resumen del día — ${new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}\n\n`;

      if (appts.rows.length) {
        response += `🕐 Citas (${appts.rows.length}):\n`;
        for (const a of appts.rows) {
          const time = new Date(a.start_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
          response += `  ${time} — ${a.patient_name} (${a.appointment_type})\n`;
        }
      } else {
        response += `🕐 Sin citas hoy\n`;
      }

      if (reminders.rows.length) {
        response += `\n🔔 Recordatorios pendientes (${reminders.rows.length}):\n`;
        for (const r of reminders.rows) {
          response += `  • ${r.title} — ${r.pet_name}\n`;
        }
      }

      if (lowStock.rows.length) {
        response += `\n⚠️ Stock bajo (${lowStock.rows.length}):\n`;
        for (const i of lowStock.rows) {
          response += `  • ${i.name}: ${i.current_stock} ${i.unit} (mín: ${i.min_stock})\n`;
        }
      }

      if (!appts.rows.length && !reminders.rows.length && !lowStock.rows.length) {
        response += '✅ Todo al día. Sin pendientes.';
      }

      return { intent, text: response };
    }

    case 'vacunas_pendientes': {
      const petsResult = await pool.query(
        `SELECT id, name, species, breed, birth_date FROM pets WHERE user_id = $1 AND status = 'alive' ORDER BY name`,
        [userId]
      );
      const pending = [];
      for (const pet of petsResult.rows) {
        const vaccines = await pool.query(
          `SELECT details, date FROM clinical_records WHERE pet_id = $1 AND record_type = 'vacuna' ORDER BY date DESC LIMIT 5`,
          [pet.id]
        );
        if (vaccines.rows.length) {
          const lastVax = vaccines.rows[0];
          const lastDate = new Date(lastVax.date);
          const monthsAgo = (Date.now() - lastDate.getTime()) / (30 * 24 * 60 * 60 * 1000);
          if (monthsAgo > 11) {
            pending.push({ pet: pet.name, lastVaccine: lastVax.details?.notes?.split('\n')[0] || 'Vacuna', lastDate: formatDate(lastVax.date) });
          }
        } else {
          pending.push({ pet: pet.name, lastVaccine: 'Sin vacunas registradas', lastDate: 'N/D' });
        }
      }

      if (!pending.length) {
        return { intent, text: '✅ Todas las mascotas tienen sus vacunas al día.' };
      }

      let response = `💉 Mascotas con vacunas pendientes o vencidas:\n\n`;
      for (const p of pending) {
        response += `• ${p.pet} — Última: ${p.lastVaccine} (${p.lastDate})\n`;
      }
      response += `\nConsidere agendar refuerzos.`;

      return {
        intent,
        text: response,
        actions: pending.map(p => ({
          label: `Recordatorio: ${p.pet}`,
          action: 'create_reminder',
          payload: { petName: p.pet },
        })),
      };
    }

    case 'protocolo_vacunacion': {
      const isDog = /perro|canino|cachorro|puppy/.test(m);
      const isCat = /gato|felino|kitten/.test(m);
      const species = isDog ? 'dog' : isCat ? 'cat' : null;

      if (!species) {
        return {
          intent,
          text: '¿Para qué especie? Ejemplo: "esquema vacunación cachorro" (perro) o "esquema vacunación gatito" (gato)',
        };
      }

      const protocols = vaccinations[species] || [];
      let response = `💉 Esquema de vacunación — ${isDog ? 'Canino' : 'Felino'}\n\n`;
      for (const proto of protocols) {
        response += `📌 ${proto.name}:\n`;
        for (const step of proto.schedule) {
          response += `  • ${step.age}: Dosis ${step.dose}\n`;
        }
        response += '\n';
      }

      return { intent, text: response };
    }

    case 'enfermedad': {
      const diseaseKeywords = {
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
        'ivdd': ['ivdd', 'hernia discal', 'discopatía'],
        'luxación': ['luxación patelar', 'luxación'],
        'displasia': ['displasia'],
        'fip': ['fip', 'peritonitis infecciosa'],
        'calicivirus': ['calicivirus'],
        'herpesvirus': ['herpesvirus', 'rinotraqueítis'],
        'panleucopenia': ['panleucopenia'],
        'felv': ['felv', 'leucemia felina'],
        'fiv': ['fiv', 'inmunodeficiencia felina'],
        'asma': ['asma', 'asma felino'],
        'cardiomiopatía': ['cardiomiopatía', 'cardiomiopatia', 'dcm', 'hcm'],
        'renal crónica': ['renal crónica', 'enfermedad renal', 'irc'],
        'obstrucción': ['obstrucción', 'obstruccion intestinal'],
        'intoxicación': ['intoxicación', 'intoxicacion', 'envenenamiento'],
        'otitis': ['otitis'],
        'periodontal': ['periodontal', 'enfermedad periodontal'],
        'forl': ['forl', 'lesión odontoclástica'],
        'flutd': ['flutd', 'síndrome urinario felino'],
        'cistitis': ['cistitis'],
        'toxoplasmosis': ['toxoplasmosis', 'toxoplasma'],
      };

      let foundDisease = null;
      for (const [key, keywords] of Object.entries(diseaseKeywords)) {
        for (const kw of keywords) {
          if (m.includes(kw)) {
            foundDisease = diseases.find((d) => d.name.toLowerCase().includes(key) || d.id.toLowerCase().includes(key));
            if (foundDisease) break;
          }
        }
        if (foundDisease) break;
      }

      if (!foundDisease) {
        return { intent, text: 'No encontré esa enfermedad en la base de datos. Escriba el nombre exacto.' };
      }

      const d = foundDisease;
      let response = `🏥 ${d.name}`;
      if (d.scientific_name) response += ` (${d.scientific_name})`;
      response += `\n\n${d.description}\n\n`;

      if (d.key_signs?.length) {
        response += `🔍 Signos clave:\n${d.key_signs.map((s) => `  • ${s}`).join('\n')}\n\n`;
      }

      if (d.treatment?.firstLine?.length) {
        response += `💊 Tratamiento primera línea:\n${d.treatment.firstLine.map((t) => `  • ${t}`).join('\n')}\n\n`;
      }

      if (d.treatment?.emergency) {
        response += `⚠️ Emergencia:\n  ${d.treatment.emergency}\n\n`;
      }

      response += `Duración: ${d.treatment?.duration || 'N/D'}\n`;
      response += `Pronóstico: ${d.prognosis || 'N/D'}`;
      if (d.is_zoonotic) response += `\n⚠️ ZOONÓSIS — Riesgo de transmisión a humanos`;

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
      const petMatch = m.match(/(?:para|a|de)\s+(\w+)/);
      const drugMatch = m.match(/receta.*?:\s*(.+)/);
      const petName = petMatch ? petMatch[1] : null;
      const rxBody = drugMatch ? drugMatch[1] : message.replace(/receta|prescribir|indicar/gi, '').trim();

      if (!rxBody) {
        return {
          intent,
          text: 'Escriba la receta. Ejemplo: "receta para Rocky: Amoxicilina 500mg cada 12h por 7 días"',
        };
      }

      let response = `📝 Borrador de receta:\n\n${rxBody}`;
      if (petName) response += `\n\nPaciente: ${petName}`;
      response += '\n\n¿Desea guardar esta receta?';

      return {
        intent,
        text: response,
        actions: [
          { label: 'Guardar receta', action: 'save_rx', payload: { petName, body: rxBody } },
        ],
      };
    }

    case 'ayuda': {
      return {
        intent,
        text: `🤖 Asistente VetCloud — Capacidades:\n\n🔍 Buscar paciente — "buscar Rocky"\n💊 Dosificación — "dosis amoxicilina perro 15kg"\n📅 Resumen del día — "qué tengo hoy"\n💉 Vacunas pendientes — "vacunas pendientes"\n📋 Protocolos — "esquema vacunación cachorro"\n🏥 Enfermedad — "parvovirus perros"\n📝 Receta rápida — "receta para Rocky: amoxicilina 500mg cada 12h"\n❓ Ayuda — "ayuda"\n\nEscriba su consulta en lenguaje natural.`,
      };
    }

    case 'saludo': {
      return {
        intent,
        text: `¡Hola! Soy su asistente veterinario. ¿En qué puedo ayudarle hoy?`,
        actions: [
          { label: 'Resumen del día', action: 'quick_query', payload: { query: 'qué tengo hoy' } },
          { label: 'Vacunas pendientes', action: 'quick_query', payload: { query: 'vacunas pendientes' } },
          { label: 'Ver capacidades', action: 'quick_query', payload: { query: 'ayuda' } },
        ],
      };
    }

    default: {
      return {
        intent: 'otro',
        text: 'No entendí su consulta. Escriba "ayuda" para ver las capacidades disponibles.',
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
  return new Date(dateStr).toLocaleDateString('es-CL');
}

module.exports = { detectIntent, processAssistantMessage };
