// Exam order the tutor takes to the lab or imaging centre: patient, tutor, ordered exams, vet.
const { C, MARGIN, createDoc, header, patientBlock, section, ensureSpace, footer, day } = require('./pdfLayout');

async function generateExamOrderPdf({ pet, owner, exams, clinic, veterinarian, orderedAt, notes }) {
  const { doc, done } = createDoc();
  let y = header(doc, clinic, 'Orden de exámenes');
  y = patientBlock(doc, y, pet, owner);

  doc.fill(C.text).fontSize(18).font('Helvetica-Bold').text('Orden de exámenes', MARGIN, y);
  y = doc.y + 6;
  doc.fill(C.muted).fontSize(9).font('Helvetica')
    .text([`Fecha: ${day(orderedAt)}`, veterinarian ? `Solicita: ${veterinarian}` : null].filter(Boolean).join('     '), MARGIN, y);
  y = doc.y + 14;

  y = section(doc, y, 'Exámenes solicitados', exams.map((e, i) => `${i + 1}. ${e.exam_name}`).join('\n'));
  if (notes) y = section(doc, y, 'Indicaciones', notes);

  y = ensureSpace(doc, y, 24);
  doc.fill(C.muted).fontSize(9).font('Helvetica')
    .text('Presenta esta orden en el laboratorio o centro de imágenes y trae los resultados a la próxima consulta.', MARGIN, y + 6, { width: doc.page.width - MARGIN * 2 });

  footer(doc, clinic);
  doc.end();
  return done;
}

module.exports = { generateExamOrderPdf };
