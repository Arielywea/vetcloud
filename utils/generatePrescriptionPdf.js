const PDFDocument = require('pdfkit');

function generatePrescriptionPdf(prescription, pet, clinic) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'letter', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const primaryColor = '#FF8F00';
    const darkText = '#1a1a1a';
    const secondaryText = '#555555';

    // ── HEADER ──
    doc.rect(0, 0, doc.page.width, 80).fill(primaryColor);

    // Draw beagle (simplified)
    const bx = 58, by = 40, bs = 22;
    // Ears
    doc.ellipse(bx - bs * 0.7, by + bs * 0.1, bs * 0.32, bs * 0.5).fill('#8D6E63');
    doc.ellipse(bx + bs * 0.7, by + bs * 0.1, bs * 0.32, bs * 0.5).fill('#8D6E63');
    // Face
    doc.circle(bx, by, bs * 0.65).fill('#FFFFFF');
    // Cap marking
    doc.circle(bx, by - bs * 0.15, bs * 0.35).fill('#5D4037');
    // Eyes
    doc.circle(bx - bs * 0.22, by, bs * 0.1).fill('#FFFFFF');
    doc.circle(bx - bs * 0.2, by, bs * 0.065).fill('#1A1A1A');
    doc.circle(bx + bs * 0.22, by, bs * 0.1).fill('#FFFFFF');
    doc.circle(bx + bs * 0.2, by, bs * 0.065).fill('#1A1A1A');
    // Nose
    doc.circle(bx, by + bs * 0.22, bs * 0.08).fill('#1A1A1A');

    doc.fill('#ffffff').fontSize(22).font('Helvetica-Bold').text('VetCloud', 100, 20);
    doc.fontSize(10).font('Helvetica').text('Receta Veterinaria', 100, 48);
    if (clinic?.veterinarian_name) {
      doc.fontSize(10).text(clinic.veterinarian_name, doc.page.width - 50, 20, { align: 'right', width: doc.page.width - 100 });
    }

    let y = 100;

    // ── INFO TABLE ──
    const colW = (doc.page.width - 120) / 2;
    const leftX = 50;
    const rightX = 50 + colW + 20;

    // Left column — Patient
    doc.roundedRect(leftX, y, colW, 120, 4).fillAndStroke('#FFF8E1', '#e0e0e0');
    doc.fill(primaryColor).fontSize(8).font('Helvetica-Bold').text('PACIENTE', leftX + 10, y + 8);
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
    doc.roundedRect(rightX, y, colW, 120, 4).fillAndStroke('#F3E5F5', '#e0e0e0');
    doc.fill('#6741D9').fontSize(8).font('Helvetica-Bold').text('PROPIETARIO', rightX + 10, y + 8);
    doc.fill(darkText).fontSize(12).font('Helvetica-Bold').text(pet.tutor_name || 'N/D', rightX + 10, y + 22, { width: colW - 20 });
    doc.fill(secondaryText).fontSize(9).font('Helvetica')
      .text(pet.tutor_email || '', rightX + 10, y + 40, { width: colW - 20 })
      .text(pet.tutor_phone || '', rightX + 10, y + 54, { width: colW - 20 })
      .text(pet.tutor_rut ? `RUT: ${pet.tutor_rut}` : '', rightX + 10, y + 68, { width: colW - 20 });

    y += 135;

    // ── METADATA BAR ──
    doc.roundedRect(50, y, doc.page.width - 100, 24, 4).fill('#f5f5f5');
    doc.fill(secondaryText).fontSize(8).font('Helvetica');
    const issuedDate = new Date(prescription.issued_at).toLocaleDateString('es-CL');
    doc.text(`Sucursal: ${prescription.clinic_branch || clinic?.clinic_name || 'N/D'}`, 60, y + 7, { width: colW - 30 })
      .text(`Prescriptor: ${prescription.veterinarian_name || clinic?.veterinarian_name || 'N/D'}`, 60 + colW, y + 7, { width: colW - 30 })
      .text(`Fecha: ${issuedDate}`, 60 + colW * 2 - 40, y + 7, { width: colW - 10, align: 'right' });
    y += 36;

    // ── PRESCRIPTION BODY ──
    doc.roundedRect(50, y, doc.page.width - 100, doc.page.height - y - 100, 4).fillAndStroke('#FAFAFA', '#e0e0e0');
    doc.fill(primaryColor).fontSize(11).font('Helvetica-Bold').text('Receta', 65, y + 10);
    doc.fill(darkText).fontSize(10).font('Helvetica')
      .text(prescription.prescription_body || '', 65, y + 28, {
        width: doc.page.width - 130,
        lineGap: 4,
      });

    // ── FOOTER ──
    const footerY = doc.page.height - 60;
    if (clinic?.vet_email) {
      doc.fill('#FF8F00').fontSize(9).font('Helvetica-Bold')
        .text(`Para consultas, responda a este correo: ${clinic.vet_email}`, 50, footerY, { align: 'center', width: doc.page.width - 100 });
    }
    doc.fill('#999999').fontSize(8).font('Helvetica')
      .text('Documento electrónico generado por VetCloud', 50, footerY + 14, { align: 'center', width: doc.page.width - 100 });

    doc.end();
  });
}

module.exports = { generatePrescriptionPdf };
