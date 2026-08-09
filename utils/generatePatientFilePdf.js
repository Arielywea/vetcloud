const PDFDocument = require('pdfkit');

function generatePatientFilePdf(pet, records, prescriptions, clinic) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'letter', margin: 50, bufferPages: true });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const primaryColor = '#FF8F00';
    const darkText = '#1a1a1a';
    const secondaryText = '#555555';

    // ── HEADER ──
    doc.rect(0, 0, doc.page.width, 80).fill(primaryColor);
    doc.fill('#ffffff').fontSize(22).font('Helvetica-Bold').text('VetCloud', 50, 20);
    doc.fontSize(10).font('Helvetica').text('Ficha Completa del Paciente', 50, 48);
    if (clinic?.veterinarian_name) {
      doc.fontSize(10).text(clinic.veterinarian_name, doc.page.width - 50, 20, { align: 'right', width: doc.page.width - 100 });
    }

    let y = 100;

    // ── INFO TABLE ──
    const colW = (doc.page.width - 120) / 2;
    const leftX = 50;
    const rightX = 50 + colW + 20;

    // Left column — Patient
    doc.roundedRect(leftX, y, colW, 130, 4).fillAndStroke('#FFF8E1', '#e0e0e0');
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
        age = yrs > 0 ? `${yrs} anio${yrs !== 1 ? 's' : ''}, ${mos} mes${mos !== 1 ? 'es' : ''}` : `${mos} mes${mos !== 1 ? 'es' : ''}`;
      }
    }
    doc.fill(secondaryText).fontSize(9).font('Helvetica')
      .text(`${speciesLabel} — ${pet.breed || 'N/D'}`, leftX + 10, y + 40, { width: colW - 20 })
      .text(`Edad: ${age}`, leftX + 10, y + 54, { width: colW - 20 })
      .text(`Sexo: ${sexLabel}  |  Peso: ${pet.weight || 'N/D'} kg`, leftX + 10, y + 68, { width: colW - 20 })
      .text(`Reproductivo: ${pet.reproductive_status || 'N/D'}`, leftX + 10, y + 82, { width: colW - 20 })
      .text(`Color: ${pet.color || 'N/D'}`, leftX + 10, y + 96, { width: colW - 20 })
      .text(`ID: ${pet.id}`, leftX + 10, y + 110, { width: colW - 20 });

    // Right column — Owner
    doc.roundedRect(rightX, y, colW, 130, 4).fillAndStroke('#F3E5F5', '#e0e0e0');
    doc.fill('#6741D9').fontSize(8).font('Helvetica-Bold').text('PROPIETARIO', rightX + 10, y + 8);
    doc.fill(darkText).fontSize(12).font('Helvetica-Bold').text(pet.tutor_name || 'N/D', rightX + 10, y + 22, { width: colW - 20 });
    doc.fill(secondaryText).fontSize(9).font('Helvetica')
      .text(pet.tutor_email || '', rightX + 10, y + 40, { width: colW - 20 })
      .text(pet.tutor_phone || '', rightX + 10, y + 54, { width: colW - 20 })
      .text(pet.tutor_rut ? `RUT: ${pet.tutor_rut}` : '', rightX + 10, y + 68, { width: colW - 20 })
      .text(pet.address || '', rightX + 10, y + 82, { width: colW - 20 });

    y += 145;

    // ── CLINICAL HISTORY ──
    if (records && records.length > 0) {
      doc.fill(primaryColor).fontSize(14).font('Helvetica-Bold').text('Historial Clinico', 50, y);
      y += 20;

      const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      for (const record of sortedRecords) {
        if (y > doc.page.height - 120) {
          doc.addPage();
          y = 50;
        }

        const d = record.details || {};
        const dateStr = new Date(record.date).toLocaleDateString('es-CL');
        const typeLabel = (record.record_type || 'consulta').charAt(0).toUpperCase() + (record.record_type || 'consulta').slice(1);

        doc.roundedRect(50, y, doc.page.width - 100, 8, 4).fill('#f5f5f5');
        doc.fill(primaryColor).fontSize(10).font('Helvetica-Bold').text(`${typeLabel} — ${dateStr}`, 60, y + 1);
        if (record.veterinarian) {
          doc.fill(secondaryText).fontSize(8).font('Helvetica').text(`Dr. ${record.veterinarian}`, doc.page.width - 60, y + 2, { align: 'right' });
        }
        y += 16;

        // SOAP sections
        const sections = [];
        if (d.motivo_consulta || d.anamnesis) sections.push({ label: 'Subjetivo', content: [d.motivo_consulta, d.anamnesis].filter(Boolean).join('\n') });
        if (d.hallazgos_examen_fisico) sections.push({ label: 'Objetivo', content: d.hallazgos_examen_fisico });
        if (d.vital_signs) {
          const vs = d.vital_signs;
          const vitals = [];
          if (vs.temperature) vitals.push(`Temp: ${vs.temperature}C`);
          if (vs.heart_rate) vitals.push(`FC: ${vs.heart_rate} lpm`);
          if (vs.respiratory_rate) vitals.push(`FR: ${vs.respiratory_rate} rpm`);
          if (vs.blood_pressure) vitals.push(`PA: ${vs.blood_pressure}`);
          if (vs.spo2) vitals.push(`SpO2: ${vs.spo2}%`);
          if (vitals.length > 0) sections.push({ label: 'Constantes', content: vitals.join(' | ') });
        }
        if (d.assessment || d.notes) sections.push({ label: 'Evaluacion', content: d.assessment || d.notes });
        if (d.plan) sections.push({ label: 'Plan', content: d.plan });
        if (d.treatment) sections.push({ label: 'Tratamiento', content: d.treatment });

        for (const sec of sections) {
          if (y > doc.page.height - 100) { doc.addPage(); y = 50; }
          doc.fill(secondaryText).fontSize(8).font('Helvetica-Bold').text(`${sec.label}:`, 60, y);
          y += 10;
          doc.fill(darkText).fontSize(9).font('Helvetica').text(sec.content, 70, y, { width: doc.page.width - 140, lineGap: 2 });
          y += doc.heightOfString(sec.content, { width: doc.page.width - 140 }) + 6;
        }

        y += 6;
      }
    }

    // ── PRESCRIPTIONS ──
    if (prescriptions && prescriptions.length > 0) {
      if (y > doc.page.height - 120) { doc.addPage(); y = 50; }
      doc.fill(primaryColor).fontSize(14).font('Helvetica-Bold').text('Recetas', 50, y);
      y += 20;

      for (const rx of prescriptions) {
        if (y > doc.page.height - 100) { doc.addPage(); y = 50; }
        const dateStr = new Date(rx.issued_at || rx.created_at).toLocaleDateString('es-CL');
        doc.roundedRect(50, y, doc.page.width - 100, 8, 4).fill('#f5f5f5');
        doc.fill(primaryColor).fontSize(10).font('Helvetica-Bold').text(`Receta — ${dateStr}`, 60, y + 1);
        y += 16;
        doc.fill(darkText).fontSize(9).font('Helvetica').text(rx.prescription_body || '', 60, y, { width: doc.page.width - 120, lineGap: 2 });
        y += doc.heightOfString(rx.prescription_body || '', { width: doc.page.width - 120 }) + 10;
      }
    }

    // ── ALLERGIES & NOTES ──
    if (pet.allergies || pet.notes || pet.base_diseases?.length) {
      if (y > doc.page.height - 100) { doc.addPage(); y = 50; }
      doc.fill(primaryColor).fontSize(14).font('Helvetica-Bold').text('Informacion Adicional', 50, y);
      y += 20;
      if (pet.allergies) { doc.fill(darkText).fontSize(9).font('Helvetica').text(`Alergias: ${pet.allergies}`, 60, y, { width: doc.page.width - 120 }); y += 14; }
      if (pet.base_diseases?.length) { doc.fill(darkText).fontSize(9).font('Helvetica').text(`Enfermedades base: ${pet.base_diseases.join(', ')}`, 60, y, { width: doc.page.width - 120 }); y += 14; }
      if (pet.notes) { doc.fill(darkText).fontSize(9).font('Helvetica').text(`Notas: ${pet.notes}`, 60, y, { width: doc.page.width - 120 }); y += 14; }
    }

    // ── FOOTER ──
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fill('#999999').fontSize(8).font('Helvetica')
        .text(`Ficha generada por VetCloud — Pagina ${i + 1} de ${pageCount}`, 50, doc.page.height - 40, { align: 'center', width: doc.page.width - 100 });
    }

    doc.end();
  });
}

module.exports = { generatePatientFilePdf };
