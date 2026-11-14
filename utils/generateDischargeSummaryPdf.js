// What the tutor takes home after a hospitalization: why the patient stayed, what was given and how
// the measurements went, the medication for home and the next dates. Built from the treatment sheet;
// the hour-by-hour detail stays in the clinic.
const { C, MARGIN, createDoc, header, patientBlock, section, ensureSpace, footer, signatureBlock, SIGNATURE_BLOCK_HEIGHT, day } = require('./pdfLayout');
const { TIME_ZONE } = require('./hospitalSchedule');

const DAY_MS = 86400000;
const shortDay = (ms) => new Date(ms).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', timeZone: TIME_ZONE });
const dayKey = (ms) => new Date(ms).toLocaleDateString('en-CA', { timeZone: TIME_ZONE });

function spanText(times) {
  const first = Math.min(...times);
  const last = Math.max(...times);
  return dayKey(first) === dayKey(last) ? `el ${shortDay(first)}` : `del ${shortDay(first)} al ${shortDay(last)}`;
}

async function generateDischargeSummaryPdf({ stay, pet, owner, treatments, tasks, prescriptions, upcoming, clinic }) {
  const { doc, done } = createDoc();
  const title = 'Resumen de hospitalización';
  let y = header(doc, clinic, title);
  y = patientBlock(doc, y, pet, owner);

  const admitted = new Date(stay.admission_date).getTime();
  const discharged = stay.discharge_date ? new Date(stay.discharge_date).getTime() : null;
  const days = Math.max(1, Math.ceil(((discharged || Date.now()) - admitted) / DAY_MS));
  doc.rect(MARGIN, y, doc.page.width - MARGIN * 2, 26).fill(C.panel);
  doc.fill(C.muted).fontSize(9).font('Helvetica')
    .text([
      `Ingreso: ${day(stay.admission_date)}`,
      discharged ? `Alta: ${day(stay.discharge_date)}` : 'Aún hospitalizado',
      `${days} ${days === 1 ? 'día' : 'días'}`,
      stay.veterinarian ? `A cargo: ${stay.veterinarian}` : null,
    ].filter(Boolean).join('     '), MARGIN + 12, y + 9, { width: doc.page.width - MARGIN * 2 - 24 });
  // No second heading: the band already names the document, and the space keeps the signature on page one
  y += 42;
  y = section(doc, y, 'Motivo de la hospitalización', stay.reason);

  const doneBy = new Map();
  for (const task of tasks) {
    if (task.status !== 'done') continue;
    const list = doneBy.get(task.treatment_id) || [];
    list.push({ at: new Date(task.scheduled_for).getTime(), value: task.value });
    doneBy.set(task.treatment_id, list);
  }

  // What was given: each treatment with how many times, over which days
  const given = treatments
    .filter((t) => t.kind !== 'constante' && doneBy.get(t.id)?.length)
    .map((t) => {
      const times = doneBy.get(t.id).map((x) => x.at);
      const count = t.kind === 'medicacion' ? `${times.length} ${times.length === 1 ? 'dosis' : 'dosis'}` : `${times.length} ${times.length === 1 ? 'vez' : 'veces'}`;
      return `${t.name}${t.instructions ? ` (${t.instructions})` : ''}: ${count}, ${spanText(times)}`;
    });
  y = section(doc, y, 'Tratamiento recibido', given.join('\n'));

  // Measurements: first and last value of each one
  const measured = treatments
    .filter((t) => t.kind === 'constante' && doneBy.get(t.id)?.some((x) => x.value))
    .map((t) => {
      const values = doneBy.get(t.id).filter((x) => x.value).sort((a, b) => a.at - b.at);
      const unit = t.unit ? ` ${t.unit}` : '';
      const first = values[0];
      const last = values[values.length - 1];
      const n = `${values.length} ${values.length === 1 ? 'medición' : 'mediciones'}`;
      return values.length === 1
        ? `${t.name}: ${first.value}${unit} (${n})`
        : `${t.name}: ${first.value}${unit} al inicio, ${last.value}${unit} al final (${n})`;
    });
  y = section(doc, y, 'Controles durante la estadía', measured.join('\n'));
  y = section(doc, y, 'Observaciones', stay.notes);

  y = section(doc, y, 'Medicación e indicaciones para la casa', prescriptions.map((p) => p.prescription_body).join('\n\n'));

  if (upcoming.length) {
    y = section(doc, y, 'Próximas fechas', upcoming.map((a) => {
      const when = new Date(a.start_time);
      const time = when.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TIME_ZONE });
      return `${day(a.start_time, { weekday: 'long', day: 'numeric', month: 'long' })} a las ${time}: ${a.appointment_type === 'control' ? 'control' : a.appointment_type || 'cita'}`;
    }).join('\n'));
  }

  y = ensureSpace(doc, y, 24);
  doc.fill(C.muted).fontSize(9).font('Helvetica')
    .text('Si nota que empeora, deja de comer, vomita o aparece algo nuevo, contáctenos de inmediato.', MARGIN, y + 6, { width: doc.page.width - MARGIN * 2 });

  y = ensureSpace(doc, doc.y + 6, SIGNATURE_BLOCK_HEIGHT);
  signatureBlock(doc, y, clinic);
  footer(doc, clinic);
  doc.end();
  return done;
}

module.exports = { generateDischargeSummaryPdf };
