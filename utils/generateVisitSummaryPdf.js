// What the tutor takes home after a visit: why they came, what was found, the diagnosis in plain
// terms, the instructions, the prescription, doses applied today and the next dates.
// The clinical working notes (anamnesis, differential reasoning) stay in the chart.
const { C, MARGIN, createDoc, header, patientBlock, section, ensureSpace, footer, day, dateOnly } = require('./pdfLayout');

const TYPE = { consulta: 'Resumen de consulta', control: 'Resumen de control', cirugia: 'Resumen de cirugía', vacuna: 'Resumen de vacunación' };
const PLAN = { octuple_sextuple: 'Óctuple / Séxtuple', kc: 'KC (tos de las perreras)', antirrabica: 'Antirrábica', triple_felina: 'Triple felina', leucemia_felina: 'Leucemia felina' };

function doseLabel(v) {
  if (v.kind === 'desparasitacion_interna') return 'Desparasitación interna';
  if (v.kind === 'desparasitacion_externa') return 'Desparasitación externa';
  return PLAN[v.plan_item] || v.product || 'Vacuna';
}

async function generateVisitSummaryPdf({ record, pet, owner, prescriptions, doses, upcoming, clinic }) {
  const { doc, done } = createDoc();
  const title = TYPE[record.record_type] || 'Resumen de atención';
  let y = header(doc, clinic, title);
  y = patientBlock(doc, y, pet, owner);

  const d = record.details || {};
  const weight = record.weight_kg ?? d.weight;
  doc.rect(MARGIN, y, doc.page.width - MARGIN * 2, 26).fill(C.panel);
  doc.fill(C.muted).fontSize(9).font('Helvetica')
    .text([
      `Fecha: ${day(record.date)}`,
      record.veterinarian ? `Atendió: ${record.veterinarian}` : null,
      weight ? `Peso: ${String(Number(weight)).replace('.', ',')} kg` : null,
    ].filter(Boolean).join('     '), MARGIN + 12, y + 9, { width: doc.page.width - MARGIN * 2 - 24 });
  y += 42;

  doc.fill(C.text).fontSize(18).font('Helvetica-Bold').text(title, MARGIN, y);
  y = doc.y + 12;

  const diagnoses = Array.isArray(d.diagnoses) ? d.diagnoses.map((x) => x.name) : [];
  y = section(doc, y, 'Motivo de la visita', d.motivo_consulta);
  y = section(doc, y, 'Lo que encontramos', d.hallazgos_examen_fisico);
  y = section(doc, y, 'Diagnóstico', d.assessment || diagnoses.join(', '));
  if (record.record_type === 'cirugia') {
    y = section(doc, y, 'Procedimiento', d.procedimiento);
    y = section(doc, y, 'Cuidados después de la cirugía', d.postoperatorio);
  }
  y = section(doc, y, 'Indicaciones', d.plan);
  const rxText = prescriptions.length ? prescriptions.map((p) => p.prescription_body).join('\n\n') : d.treatment;
  y = section(doc, y, 'Tratamiento', rxText);

  if (doses.length) {
    y = section(doc, y, 'Aplicado hoy', doses.map((v) =>
      [doseLabel(v), v.kind === 'vacuna' && PLAN[v.plan_item] ? v.product : v.kind !== 'vacuna' ? v.product : null, v.lot ? `lote ${v.lot}` : null]
        .filter(Boolean).join(' · ')).join('\n'));
  }

  const next = [
    ...upcoming.map((a) => ({ when: new Date(a.start_time).getTime(), text: `${day(a.start_time, { weekday: 'long', day: 'numeric', month: 'long' })} a las ${new Date(a.start_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Santiago' })}: ${a.appointment_type === 'control' ? 'control' : a.appointment_type || 'cita'}` })),
    ...doses.filter((v) => v.next_due_at).map((v) => ({ when: new Date(v.next_due_at).getTime(), text: `${dateOnly(v.next_due_at)}: próxima ${doseLabel(v).toLowerCase()}` })),
  ].sort((a, b) => a.when - b.when);
  if (next.length) y = section(doc, y, 'Próximas fechas', next.map((n) => n.text).join('\n'));

  y = ensureSpace(doc, y, 24);
  doc.fill(C.muted).fontSize(9).font('Helvetica')
    .text('Si nota que empeora, deja de comer o aparece algo nuevo, contáctenos antes de la próxima cita.', MARGIN, y + 6, { width: doc.page.width - MARGIN * 2 });

  footer(doc, clinic);
  doc.end();
  return done;
}

module.exports = { generateVisitSummaryPdf };
