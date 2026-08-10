const PDFDocument = require('pdfkit');

function generatePatientFilePdf(pet, records, clinic) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'letter', margin: 50, bufferPages: true });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const navy = '#0B1D3A';
    const gold = '#C9A227';
    const darkText = '#1A2332';
    const secondaryText = '#5A6B80';
    const lightText = '#8896A8';
    const surfaceBg = '#F7F8FB';
    const white = '#FFFFFF';
    const border = '#DDE3EC';

    const pageW = doc.page.width;
    const pageH = doc.page.height;
    const margin = 50;
    const contentW = pageW - margin * 2;

    // ── HEADER ──
    doc.rect(0, 0, pageW, 85).fill(navy);

    // Beagle logo
    const bx = 58, by = 42, bs = 22;
    doc.ellipse(bx - bs * 0.7, by + bs * 0.1, bs * 0.32, bs * 0.5).fill('#8D6E63');
    doc.ellipse(bx + bs * 0.7, by + bs * 0.1, bs * 0.32, bs * 0.5).fill('#8D6E63');
    doc.circle(bx, by, bs * 0.65).fill('#FFFFFF');
    doc.circle(bx, by - bs * 0.15, bs * 0.35).fill('#5D4037');
    doc.circle(bx - bs * 0.22, by, bs * 0.1).fill('#FFFFFF');
    doc.circle(bx - bs * 0.2, by, bs * 0.065).fill('#1A1A1A');
    doc.circle(bx + bs * 0.22, by, bs * 0.1).fill('#FFFFFF');
    doc.circle(bx + bs * 0.2, by, bs * 0.065).fill('#1A1A1A');
    doc.circle(bx, by + bs * 0.22, bs * 0.08).fill('#1A1A1A');

    doc.fill(white).fontSize(22).font('Helvetica-Bold').text('VetCloud', 100, 22);
    doc.fontSize(10).font('Helvetica').fill(gold).text('Ficha Clinica del Paciente', 100, 48);
    if (clinic?.veterinarian_name) {
      doc.fill(white).fontSize(10).font('Helvetica').text(clinic.veterinarian_name, pageW - margin, 22, { align: 'right', width: contentW });
    }
    if (clinic?.clinic_name) {
      doc.fill(lightText).fontSize(8).font('Helvetica').text(clinic.clinic_name, pageW - margin, 38, { align: 'right', width: contentW });
    }

    let y = 105;
    const colW = (contentW - 20) / 2;
    const leftX = margin;
    const rightX = margin + colW + 20;

    // ── CARD: PACIENTE ──
    doc.roundedRect(leftX, y, colW, 140, 8).fillAndStroke(white, border);
    doc.roundedRect(leftX, y, colW, 28, { tl: 8, tr: 8, bl: 0, br: 0 }).fill(navy);
    doc.fill(gold).fontSize(8).font('Helvetica-Bold').text('PACIENTE', leftX + 12, y + 9);

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

    doc.fill(darkText).fontSize(13).font('Helvetica-Bold').text(pet.name || 'N/D', leftX + 12, y + 38, { width: colW - 24 });
    let py = y + 56;
    doc.fill(secondaryText).fontSize(9).font('Helvetica');
    doc.text(`${speciesLabel} — ${pet.breed || 'N/D'}`, leftX + 12, py, { width: colW - 24 }); py += 14;
    doc.text(`Edad: ${age}  |  Sexo: ${sexLabel}`, leftX + 12, py, { width: colW - 24 }); py += 14;
    doc.text(`Peso: ${pet.weight || 'N/D'} kg  |  Color: ${pet.color || 'N/D'}`, leftX + 12, py, { width: colW - 24 }); py += 14;
    doc.text(`Reproductivo: ${pet.reproductive_status || 'N/D'}`, leftX + 12, py, { width: colW - 24 }); py += 14;
    doc.fill(lightText).fontSize(7).text(`ID: ${pet.id}`, leftX + 12, py, { width: colW - 24 });

    // ── CARD: TUTOR ──
    doc.roundedRect(rightX, y, colW, 140, 8).fillAndStroke(white, border);
    doc.roundedRect(rightX, y, colW, 28, { tl: 8, tr: 8, bl: 0, br: 0 }).fill(navy);
    doc.fill(gold).fontSize(8).font('Helvetica-Bold').text('TUTOR / PROPIETARIO', rightX + 12, y + 9);

    doc.fill(darkText).fontSize(13).font('Helvetica-Bold').text(pet.tutor_name || 'N/D', rightX + 12, y + 38, { width: colW - 24 });
    py = y + 56;
    doc.fill(secondaryText).fontSize(9).font('Helvetica');
    if (pet.tutor_email) { doc.text(pet.tutor_email, rightX + 12, py, { width: colW - 24 }); py += 14; }
    if (pet.tutor_phone || pet.phone) { doc.text(pet.tutor_phone || pet.phone, rightX + 12, py, { width: colW - 24 }); py += 14; }
    if (pet.tutor_rut) { doc.text(`RUT: ${pet.tutor_rut}`, rightX + 12, py, { width: colW - 24 }); py += 14; }
    if (pet.address) { doc.text(pet.address, rightX + 12, py, { width: colW - 24 }); py += 14; }

    y += 155;

    // ── RESUMEN CLINICO ──
    const hasClinicalSummary = pet.allergies || pet.base_diseases?.length || pet.pre_diagnostico || pet.notes;
    if (hasClinicalSummary) {
      if (y > pageH - 140) { doc.addPage(); y = margin; }
      doc.roundedRect(margin, y, contentW, 10, { tl: 8, tr: 8, bl: 0, br: 0 }).fill(navy);
      doc.fill(gold).fontSize(11).font('Helvetica-Bold').text('Resumen Clinico', margin + 12, y + 12, { width: contentW - 24 });
      y += 30;

      doc.roundedRect(margin, y, contentW, 60, { tl: 0, tr: 0, bl: 8, br: 8 }).fillAndStroke(surfaceBg, border);
      let sy = y + 10;

      if (pet.allergies) {
        doc.fill(darkText).fontSize(9).font('Helvetica-Bold').text('Alergias: ', margin + 12, sy, { continued: true, width: contentW - 24 });
        doc.font('Helvetica').fill(secondaryText).text(pet.allergies, { width: contentW - 24 });
        sy += 14;
      }
      if (pet.base_diseases?.length) {
        doc.fill(darkText).fontSize(9).font('Helvetica-Bold').text('Enfermedades base: ', margin + 12, sy, { continued: true, width: contentW - 24 });
        doc.font('Helvetica').fill(secondaryText).text(pet.base_diseases.join(', '), { width: contentW - 24 });
        sy += 14;
      }
      if (pet.pre_diagnostico) {
        doc.fill(darkText).fontSize(9).font('Helvetica-Bold').text('Pre-diagnostico: ', margin + 12, sy, { continued: true, width: contentW - 24 });
        doc.font('Helvetica').fill(secondaryText).text(pet.pre_diagnostico, { width: contentW - 24 });
        sy += 14;
      }
      if (pet.notes) {
        doc.fill(darkText).fontSize(9).font('Helvetica-Bold').text('Notas: ', margin + 12, sy, { continued: true, width: contentW - 24 });
        doc.font('Helvetica').fill(secondaryText).text(pet.notes, { width: contentW - 24 });
        sy += 14;
      }

      y = sy + 12;
    }

    // ── HISTORIAL CLINICO ──
    if (records && records.length > 0) {
      if (y > pageH - 100) { doc.addPage(); y = margin; }
      doc.roundedRect(margin, y, contentW, 10, { tl: 8, tr: 8, bl: 0, br: 0 }).fill(navy);
      doc.fill(gold).fontSize(11).font('Helvetica-Bold').text('Historial Clinico', margin + 12, y + 12, { width: contentW - 24 });
      y += 30;

      const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      for (const record of sortedRecords) {
        if (y > pageH - 140) { doc.addPage(); y = margin; }

        const d = record.details || {};
        const dateStr = new Date(record.date).toLocaleDateString('es-CL');
        const timeStr = new Date(record.date).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
        const typeLabel = (record.record_type || 'consulta').charAt(0).toUpperCase() + (record.record_type || 'consulta').slice(1);

        // Record header bar
        doc.roundedRect(margin, y, contentW, 24, { tl: 6, tr: 6, bl: 0, br: 0 }).fill(navy);
        doc.fill(white).fontSize(9).font('Helvetica-Bold').text(`${typeLabel}  —  ${dateStr} ${timeStr}`, margin + 12, y + 7, { width: contentW - 24 });
        if (record.veterinarian) {
          doc.fill(gold).fontSize(8).font('Helvetica').text(`Dr. ${record.veterinarian}`, pageW - margin - 12, y + 8, { align: 'right', width: 150 });
        }
        y += 26;

        // Record body
        const bodyStartY = y;
        doc.roundedRect(margin, y, contentW, 20, { tl: 0, tr: 0, bl: 6, br: 6 }).fillAndStroke(white, border);
        y += 8;

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
          if (vitals.length > 0) sections.push({ label: 'Constantes', content: vitals.join('  |  ') });
        }
        if (d.assessment || d.notes) sections.push({ label: 'Evaluacion', content: d.assessment || d.notes });
        if (d.plan) sections.push({ label: 'Plan', content: d.plan });
        if (d.treatment) sections.push({ label: 'Tratamiento', content: d.treatment });

        // Cirugia fields
        if (d.procedimiento) sections.push({ label: 'Procedimiento', content: d.procedimiento });
        if (d.descripcion) sections.push({ label: 'Descripcion', content: d.descripcion });
        if (d.postoperatorio) sections.push({ label: 'Postoperatorio', content: d.postoperatorio });
        if (d.files?.length > 0) sections.push({ label: 'Archivos adjuntos', content: `${d.files.length} archivo(s) adjunto(s) — disponible(s) en la historia clinica digital` });

        for (const sec of sections) {
          if (y > pageH - 80) { doc.addPage(); y = margin; }
          doc.fill(gold).fontSize(8).font('Helvetica-Bold').text(`${sec.label}:`, margin + 14, y);
          y += 10;
          doc.fill(darkText).fontSize(9).font('Helvetica').text(sec.content, margin + 20, y, { width: contentW - 40, lineGap: 2 });
          y += doc.heightOfString(sec.content, { width: contentW - 40 }) + 6;
        }

        if (y === bodyStartY + 8) {
          doc.fill(lightText).fontSize(8).font('Helvetica').text('Sin datos clinicos registrados', margin + 14, y);
          y += 12;
        }

        // Bottom border
        doc.rect(margin, y, contentW, 1).fill(border);
        y += 10;
      }
    } else {
      if (y > pageH - 80) { doc.addPage(); y = margin; }
      doc.fill(lightText).fontSize(9).font('Helvetica').text('No hay registros clinicos disponibles.', margin, y, { width: contentW, align: 'center' });
      y += 20;
    }

    // ── FOOTER ──
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.rect(0, pageH - 35, pageW, 35).fill(navy);
      doc.fill(lightText).fontSize(7).font('Helvetica')
        .text(`Ficha clinica generada por VetCloud  —  Pagina ${i + 1} de ${pageCount}`, margin, pageH - 22, { width: contentW, align: 'center' });
    }

    doc.end();
  });
}

module.exports = { generatePatientFilePdf };
