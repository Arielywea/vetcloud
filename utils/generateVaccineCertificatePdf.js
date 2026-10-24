// Vaccination and deworming certificate: every recorded dose with product, lot and the vet who applied
// it, and when the next one is due. What a tutor shows at a kennel, a groomer or the border.
const { C, MARGIN, createDoc, header, patientBlock, ensureSpace, footer, dateOnly, dateKey } = require('./pdfLayout');

const PLAN = { octuple_sextuple: 'Óctuple / Séxtuple', kc: 'KC (tos de las perreras)', antirrabica: 'Antirrábica', triple_felina: 'Triple felina', leucemia_felina: 'Leucemia felina' };

function table(doc, y, title, rows, todayKey) {
  if (!rows.length) return y;
  const x = MARGIN;
  const w = doc.page.width - MARGIN * 2;
  const cols = [
    { label: 'Fecha', w: 0.15 },
    { label: 'Vacuna / producto', w: 0.33 },
    { label: 'Lote', w: 0.12 },
    { label: 'Veterinario', w: 0.22 },
    { label: 'Próxima', w: 0.18 },
  ].map((c) => ({ ...c, w: c.w * w }));

  y = ensureSpace(doc, y, 70);
  doc.fill(C.primary).fontSize(12).font('Helvetica-Bold').text(title, x, y);
  y += 20;
  const head = (yy) => {
    doc.rect(x, yy, w, 20).fill(C.panel);
    let cx = x + 8;
    doc.fill(C.muted).fontSize(8.5).font('Helvetica-Bold');
    cols.forEach((c) => { doc.text(c.label, cx, yy + 6, { width: c.w - 10, lineBreak: false }); cx += c.w; });
    return yy + 20;
  };
  y = head(y);
  for (const r of rows) {
    const cells = [dateOnly(r.applied_at, { day: '2-digit', month: '2-digit', year: 'numeric' }), r.what, r.lot || '—', r.veterinarian || '—',
      r.next_due_at ? dateOnly(r.next_due_at, { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'];
    doc.fontSize(9.5).font('Helvetica');
    const h = Math.max(22, ...cells.map((t, i) => doc.heightOfString(String(t), { width: cols[i].w - 10 }) + 12));
    if (y + h > doc.page.height - 80) { doc.addPage(); y = head(MARGIN); }
    let cx = x + 8;
    cells.forEach((t, i) => {
      const overdue = i === 4 && r.next_due_at && dateKey(r.next_due_at) < todayKey && r.latest;
      doc.fill(overdue ? C.error : C.text).font(i === 1 ? 'Helvetica-Bold' : 'Helvetica').text(String(t), cx, y + 6, { width: cols[i].w - 10 });
      cx += cols[i].w;
    });
    doc.moveTo(x, y + h).lineTo(x + w, y + h).lineWidth(0.5).strokeColor(C.border).stroke();
    y += h;
  }
  return y + 18;
}

async function generateVaccineCertificatePdf({ pet, owner, vaccinations, clinic }) {
  const { doc, done } = createDoc();
  let y = header(doc, clinic, 'Certificado de vacunación');
  y = patientBlock(doc, y, pet, owner);
  doc.fill(C.text).fontSize(18).font('Helvetica-Bold').text('Certificado de vacunación y desparasitación', MARGIN, y);
  y = doc.y + 6;
  doc.fill(C.muted).fontSize(9.5).font('Helvetica')
    .text(`Emitido el ${new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Santiago' })}. Registro de las dosis aplicadas o declaradas en esta clínica.`, MARGIN, y, { width: doc.page.width - MARGIN * 2 });
  y = doc.y + 18;

  const sorted = [...vaccinations].sort((a, b) => String(dateKey(b.applied_at)).localeCompare(String(dateKey(a.applied_at))));
  // Only the latest dose of each kind can be "overdue"; older ones were replaced
  const seen = new Set();
  const rows = sorted.map((v) => {
    const key = `${v.kind}|${v.plan_item || ''}|${v.kind === 'vacuna' && (!v.plan_item || v.plan_item === 'otra') ? (v.product || '').toLowerCase() : ''}`;
    const latest = !seen.has(key);
    seen.add(key);
    const label = v.kind === 'vacuna' ? (PLAN[v.plan_item] || v.product || 'Vacuna') : v.kind === 'desparasitacion_interna' ? 'Interna' : 'Externa';
    const what = v.kind === 'vacuna' && PLAN[v.plan_item] && v.product ? `${label}\n${v.product}` : v.kind !== 'vacuna' && v.product ? `${label}\n${v.product}` : label;
    const declared = /declarada/i.test(v.notes || '');
    return { ...v, what: declared ? `${what}\n(declarada por el tutor)` : what, latest };
  });
  const todayKey = dateKey(new Date());
  y = table(doc, y, 'Vacunas', rows.filter((r) => r.kind === 'vacuna'), todayKey);
  y = table(doc, y, 'Desparasitaciones', rows.filter((r) => r.kind !== 'vacuna'), todayKey);
  if (!rows.length) {
    doc.fill(C.muted).fontSize(11).font('Helvetica').text('No hay dosis registradas.', MARGIN, y);
    y = doc.y + 20;
  }

  y = ensureSpace(doc, y, 90);
  const sigX = doc.page.width - MARGIN - 220;
  doc.moveTo(sigX, y + 50).lineTo(sigX + 220, y + 50).lineWidth(0.8).strokeColor(C.text).stroke();
  doc.fill(C.text).fontSize(10).font('Helvetica-Bold').text(clinic?.veterinarian_name || 'Médico veterinario', sigX, y + 56, { width: 220, align: 'center' });
  doc.fill(C.muted).fontSize(8.5).font('Helvetica').text('Firma y timbre', sigX, y + 70, { width: 220, align: 'center' });

  footer(doc, clinic, 'Las dosis marcadas como declaradas fueron informadas por el tutor y no se aplicaron en esta clínica.');
  doc.end();
  return done;
}

module.exports = { generateVaccineCertificatePdf };
