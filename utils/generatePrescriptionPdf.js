const PDFDocument = require('pdfkit');

function generatePrescriptionPdf(prescription, pet, clinic) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'letter', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Saber palette (constants/colors.ts): royal blue, antique gold, ivory
    const primaryColor = '#12264D';
    const accentColor = '#A8842A';
    const darkText = '#141C33';
    const secondaryText = '#4E586F';
    const borderColor = '#DDD5C4';
    const panelColor = '#F5F2EA';

    // ── HEADER: the clinic's identity (falls back to VetCloud) ──
    const pageW = doc.page.width;
    doc.rect(0, 0, pageW, 84).fill('#0B1D3A');
    doc.rect(0, 84, pageW, 2).fill(accentColor);

    const clinicTitle = clinic?.clinic_name || 'VetCloud';
    doc.fill('#FFFFFF').fontSize(20).font('Helvetica-Bold').text(clinicTitle, 50, 18, { width: pageW / 2 });
    const contact = [clinic?.clinic_address, clinic?.clinic_phone].filter(Boolean).join('  ·  ');
    doc.fill('#D9D4C6').fontSize(9).font('Helvetica').text(contact || 'Receta veterinaria', 50, 46, { width: pageW / 2 });
    if (contact) doc.text('Receta veterinaria', 50, 60, { width: pageW / 2 });

    if (clinic?.veterinarian_name) {
      doc.fill('#FFFFFF').fontSize(10).font('Helvetica-Bold')
        .text(clinic.veterinarian_name, pageW / 2, 24, { align: 'right', width: pageW / 2 - 50 });
      doc.fill('#D9D4C6').fontSize(8).font('Helvetica')
        .text('Médico veterinario', pageW / 2, 40, { align: 'right', width: pageW / 2 - 50 });
    }

    let y = 104;

    // ── INFO TABLE ──
    const colW = (doc.page.width - 120) / 2;
    const leftX = 50;
    const rightX = 50 + colW + 20;

    // Left column — Patient
    doc.roundedRect(leftX, y, colW, 120, 4).fillAndStroke(panelColor, borderColor);
    doc.fill(accentColor).fontSize(8).font('Helvetica-Bold').text('PACIENTE', leftX + 10, y + 8);
    doc.fill(darkText).fontSize(12).font('Helvetica-Bold').text(pet.name || '', leftX + 10, y + 22, { width: colW - 20 });
    const speciesLabel = pet.species === 'dog' ? 'Canino' : pet.species === 'cat' ? 'Felino' : 'N/D';
    const sexLabel = pet.sex === 'macho' ? 'Macho' : pet.sex === 'hembra' ? 'Hembra' : 'N/D';
    let age = 'N/D';
    if (pet.birth_date) {
      const bd = new Date(pet.birth_date);
      if (!isNaN(bd.getTime())) {
        const months = Math.floor((Date.now() - bd.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
        const yrs = Math.floor(months / 12);
        const mos = months % 12;
        age = yrs > 0 ? `${yrs} año${yrs !== 1 ? 's' : ''}, ${mos} mes${mos !== 1 ? 'es' : ''}` : `${mos} mes${mos !== 1 ? 'es' : ''}`;
      }
    }
    doc.fill(secondaryText).fontSize(9).font('Helvetica')
      .text(`${speciesLabel} — ${pet.breed || 'N/D'}`, leftX + 10, y + 40, { width: colW - 20 })
      .text(`Edad: ${age}`, leftX + 10, y + 54, { width: colW - 20 })
      .text(`Sexo: ${sexLabel}  |  Peso: ${pet.weight || 'N/D'} kg`, leftX + 10, y + 68, { width: colW - 20 })
      .text(`Reproductivo: ${pet.reproductive_status || 'N/D'}`, leftX + 10, y + 82, { width: colW - 20 })
      .text(`ID: ${pet.id}`, leftX + 10, y + 96, { width: colW - 20 });

    // Right column — Owner
    doc.roundedRect(rightX, y, colW, 120, 4).fillAndStroke(panelColor, borderColor);
    doc.fill(accentColor).fontSize(8).font('Helvetica-Bold').text('PROPIETARIO', rightX + 10, y + 8);
    doc.fill(darkText).fontSize(12).font('Helvetica-Bold').text(pet.tutor_name || 'N/D', rightX + 10, y + 22, { width: colW - 20 });
    doc.fill(secondaryText).fontSize(9).font('Helvetica')
      .text(pet.tutor_email || '', rightX + 10, y + 40, { width: colW - 20 })
      .text(pet.tutor_phone || '', rightX + 10, y + 54, { width: colW - 20 })
      .text(pet.tutor_rut ? `RUT: ${pet.tutor_rut}` : '', rightX + 10, y + 68, { width: colW - 20 });

    y += 135;

    // ── METADATA BAR ──
    doc.roundedRect(50, y, doc.page.width - 100, 24, 4).fill(panelColor);
    doc.fill(secondaryText).fontSize(8).font('Helvetica');
    const issuedDate = new Date(prescription.issued_at).toLocaleDateString('es-CL', { timeZone: 'America/Santiago' });
    const metaW = (doc.page.width - 120) / 3;
    doc.text(`Sucursal: ${prescription.clinic_branch || clinic?.clinic_name || 'N/D'}`, 60, y + 7, { width: metaW, lineBreak: false, ellipsis: true })
      .text(`Prescriptor: ${prescription.veterinarian_name || clinic?.veterinarian_name || 'N/D'}`, 60 + metaW, y + 7, { width: metaW, lineBreak: false, ellipsis: true })
      .text(`Fecha: ${issuedDate}`, 60 + metaW * 2, y + 7, { width: metaW, align: 'right', lineBreak: false });
    y += 36;

    // ── PRESCRIPTION BODY ──
    doc.roundedRect(50, y, doc.page.width - 100, doc.page.height - y - 100, 4).fillAndStroke('#FFFFFF', borderColor);
    doc.fill(primaryColor).fontSize(11).font('Helvetica-Bold').text('Receta', 65, y + 10);
    doc.fill(darkText).fontSize(10).font('Helvetica')
      .text(prescription.prescription_body || '', 65, y + 28, {
        width: doc.page.width - 130,
        lineGap: 4,
      });

    // ── FOOTER ──
    // Footer sits inside the bottom margin: drop it so pdfkit doesn't add blank pages
    doc.page.margins.bottom = 0;
    const footerY = doc.page.height - 60;
    if (clinic?.vet_email) {
      doc.fill(primaryColor).fontSize(9).font('Helvetica-Bold')
        .text(`Consultas: ${clinic.vet_email}`, 50, footerY, { align: 'center', width: doc.page.width - 100 });
    }
    doc.fill('#999999').fontSize(8).font('Helvetica')
      .text('Documento electrónico generado por VetCloud', 50, footerY + 14, { align: 'center', width: doc.page.width - 100 });

    doc.end();
  });
}

module.exports = { generatePrescriptionPdf };
