// Shared layout for the documents a tutor takes home (visit summary, vaccine certificate): the clinic's
// band on top, patient and tutor side by side, titled sections that break across pages, and a footer.
// Same Saber palette as the prescription PDF.
const PDFDocument = require('pdfkit');

const C = {
  chrome: '#0B1D3A',
  primary: '#12264D',
  accent: '#A8842A',
  text: '#141C33',
  muted: '#4E586F',
  border: '#DDD5C4',
  panel: '#F5F2EA',
  onChrome: '#F3EFE4',
  onChromeMuted: '#D9D4C6',
  ok: '#2E7D5B',
  warn: '#B25E09',
  error: '#B42318',
};
const MARGIN = 50;
const FOOTER_SPACE = 70;

const LONG = { day: 'numeric', month: 'long', year: 'numeric' };

/** A DATE column (applied_at, next_due_at): pg builds it as local midnight, so read it with local getters */
function dateOnly(value, opts = LONG) {
  if (!value) return '';
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate()).toLocaleDateString('es-CL', opts);
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString('es-CL', opts) : '';
}

/** A timestamp (visit date, appointment): shown in Chilean time */
function day(value, opts = LONG) {
  if (!value) return '';
  const d = new Date(value);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-CL', { ...opts, timeZone: 'America/Santiago' });
}

/** Compare a DATE column with today (YYYY-MM-DD, local) */
function dateKey(value) {
  if (!value) return null;
  if (value instanceof Date) return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  return String(value).slice(0, 10);
}

function formatPhone(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  const m = /^56(9)(\d{4})(\d{4})$/.exec(d);
  return m ? `+56 ${m[1]} ${m[2]} ${m[3]}` : raw || '';
}

function formatRut(rut) {
  const m = /^(\d+)-([\dK])$/.exec(rut || '');
  return m ? `${m[1].replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${m[2]}` : rut || '';
}

function ageText(birth, estimated) {
  if (!birth) return '';
  const bd = new Date(birth);
  if (isNaN(bd.getTime())) return '';
  const months = Math.floor((Date.now() - bd.getTime()) / (30.44 * 86400000));
  const y = Math.floor(months / 12);
  const mo = months % 12;
  const t = y > 0 ? `${y} año${y !== 1 ? 's' : ''}${mo ? `, ${mo} mes${mo !== 1 ? 'es' : ''}` : ''}` : `${mo} mes${mo !== 1 ? 'es' : ''}`;
  return estimated ? `${t} (aprox.)` : t;
}

const SPECIES = { dog: 'Canino', cat: 'Felino' };

function createDoc() {
  const doc = new PDFDocument({ size: 'letter', margin: MARGIN, bufferPages: true });
  const chunks = [];
  const done = new Promise((resolve, reject) => {
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
  return { doc, done };
}

function header(doc, clinic, title) {
  const w = doc.page.width;
  doc.rect(0, 0, w, 84).fill(C.chrome);
  doc.rect(0, 84, w, 2).fill(C.accent);
  doc.fill(C.onChrome).fontSize(20).font('Helvetica-Bold').text(clinic?.clinic_name || 'VetCloud', MARGIN, 18, { width: w / 2 });
  const contact = [clinic?.clinic_address, clinic?.clinic_phone].filter(Boolean).join('  ·  ');
  doc.fill(C.onChromeMuted).fontSize(9).font('Helvetica').text(contact || title, MARGIN, 46, { width: w / 2 });
  if (contact) doc.text(title, MARGIN, 60, { width: w / 2 });
  if (clinic?.veterinarian_name) {
    doc.fill(C.onChrome).fontSize(10).font('Helvetica-Bold').text(clinic.veterinarian_name, w / 2, 24, { align: 'right', width: w / 2 - MARGIN });
    doc.fill(C.onChromeMuted).fontSize(8).font('Helvetica').text('Médico veterinario', w / 2, 40, { align: 'right', width: w / 2 - MARGIN });
  }
  return 104;
}

/** Patient and tutor panels; returns the y below them */
function patientBlock(doc, y, pet, owner) {
  const colW = (doc.page.width - MARGIN * 2 - 16) / 2;
  const h = 96;
  const left = MARGIN;
  const right = MARGIN + colW + 16;
  doc.rect(left, y, colW, h).fill(C.panel);
  doc.rect(right, y, colW, h).fill(C.panel);

  doc.fill(C.accent).fontSize(8).font('Helvetica-Bold').text('Paciente', left + 12, y + 10);
  doc.fill(C.text).fontSize(13).font('Helvetica-Bold').text(pet.name || '', left + 12, y + 23, { width: colW - 24 });
  const species = pet.species === 'other' ? (pet.species_other || 'Otra especie') : SPECIES[pet.species] || '';
  const sex = pet.sex === 'macho' ? 'Macho' : pet.sex === 'hembra' ? 'Hembra' : '';
  const lines = [
    [species, pet.breed].filter(Boolean).join(' · '),
    [sex, ageText(pet.birth_date, pet.birth_date_estimated)].filter(Boolean).join(' · '),
    [pet.id_number ? `Microchip ${pet.id_number}` : null, pet.registry_number ? `Registro ${pet.registry_number}` : null].filter(Boolean).join(' · '),
  ].filter(Boolean);
  doc.fill(C.muted).fontSize(9).font('Helvetica');
  lines.forEach((l, i) => doc.text(l, left + 12, y + 42 + i * 13, { width: colW - 24, lineBreak: false, ellipsis: true }));

  doc.fill(C.accent).fontSize(8).font('Helvetica-Bold').text('Tutor', right + 12, y + 10);
  doc.fill(C.text).fontSize(13).font('Helvetica-Bold').text(owner?.name || pet.tutor_name || '—', right + 12, y + 23, { width: colW - 24 });
  const tl = [owner?.rut ? `RUT ${formatRut(owner.rut)}` : null, formatPhone(owner?.phone || pet.phone), owner?.email || pet.email].filter(Boolean);
  doc.fill(C.muted).fontSize(9).font('Helvetica');
  tl.forEach((l, i) => doc.text(l, right + 12, y + 42 + i * 13, { width: colW - 24, lineBreak: false, ellipsis: true }));
  return y + h + 18;
}

function ensureSpace(doc, y, needed) {
  if (y + needed <= doc.page.height - FOOTER_SPACE) return y;
  doc.addPage();
  return MARGIN;
}

/** A titled block of running text; skipped when empty. Returns the new y */
function section(doc, y, title, body) {
  const text = String(body || '').trim();
  if (!text) return y;
  const width = doc.page.width - MARGIN * 2;
  doc.font('Helvetica').fontSize(10.5);
  const h = doc.heightOfString(text, { width, lineGap: 3 });
  y = ensureSpace(doc, y, Math.min(h, 120) + 28);
  doc.fill(C.primary).fontSize(11).font('Helvetica-Bold').text(title, MARGIN, y);
  y += 17;
  doc.fill(C.text).fontSize(10.5).font('Helvetica').text(text, MARGIN, y, { width, lineGap: 3 });
  return doc.y + 14;
}

function footer(doc, clinic, note) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.page.margins.bottom = 0; // writing inside the margin must not spawn pages
    const y = doc.page.height - 52;
    if (note) doc.fill(C.muted).fontSize(8).font('Helvetica').text(note, MARGIN, y - 14, { width: doc.page.width - MARGIN * 2, align: 'center' });
    const contact = clinic?.vet_email ? `Consultas: ${clinic.vet_email}  ·  ` : '';
    doc.fill('#999999').fontSize(8).font('Helvetica')
      .text(`${contact}Documento generado por VetCloud  ·  Página ${i - range.start + 1} de ${range.count}`, MARGIN, y, { width: doc.page.width - MARGIN * 2, align: 'center' });
  }
}

module.exports = { C, MARGIN, createDoc, header, patientBlock, section, ensureSpace, footer, day, dateOnly, dateKey, formatRut };
