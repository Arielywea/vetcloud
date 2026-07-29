#!/usr/bin/env npx tsx
/**
 * Seed script — writes directly to Neon PostgreSQL
 * 
 * Usage: npx tsx scripts/seed-diseases.ts
 */

import { Pool } from 'pg';
import { ALL_DISEASES } from '../data';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_THFGcfaW5M7h@ep-aged-river-ac7edlxd-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require',
});

function formatKeySigns(raw: any[]): string[] {
  return raw.map(s => `🔴 ${s.sign}: ${s.description}`);
}

function formatDiagnosis(raw: any): any {
  return {
    clinicalExam: raw.clinical_examination || '',
    labTests: (raw.lab_tests || []).map((t: any) => `${t.test}: ${t.description}${t.interpretation ? ` (${t.interpretation})` : ''}`),
    imaging: (raw.imaging || []).map((i: any) => `${i.study}: ${i.findings}`),
    differentialDiagnosis: (raw.differential_diagnosis || []).map((d: any) => `${d.disease}: ${d.differentiating}`),
  };
}

function formatTreatment(raw: any): any {
  const firstLine = (raw.first_line || []).map((t: any) => `${t.intervention}: ${t.details}`);
  const secondLine = (raw.second_line || []).map((t: any) => `${t.intervention}: ${t.details}`);
  const emergency = raw.emergency
    ? `PRESENTACIÓN: ${raw.emergency.presentation}\nPROTOCOLO:\n${(raw.emergency.protocol || []).map((p: string) => `  - ${p}`).join('\n')}`
    : '';
  return {
    firstLine,
    secondLine,
    emergency,
    duration: raw.duration || '',
    notes: raw.notes || '',
  };
}

function formatPrevention(raw: any[]): string[] {
  return raw.map(p => `${p.measure}: ${p.details}`);
}

async function upsertDisease(d: any): Promise<boolean> {
  const species = Array.isArray(d.species) 
    ? (d.species.length > 1 ? 'both' : d.species[0])
    : d.species;

  const keySigns = formatKeySigns(d.key_signs || []);
  const diagnosis = formatDiagnosis(d.diagnosis || {});
  const treatment = formatTreatment(d.treatment || {});
  const prevention = formatPrevention(d.prevention || []);
  const prognosis = d.prognosis?.classification || 'guarded';
  const references = (d.references || []).map((r: any) => r.citation || r);
  const scientificName = d.scientific_name || d.name;

  const result = await pool.query(
    `INSERT INTO diseases (name, scientific_name, species, category, severity, description, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name, scientific_name = EXCLUDED.scientific_name, species = EXCLUDED.species,
       category = EXCLUDED.category, severity = EXCLUDED.severity, description = EXCLUDED.description,
       key_signs = EXCLUDED.key_signs, diagnosis = EXCLUDED.diagnosis, treatment = EXCLUDED.treatment,
       prevention = EXCLUDED.prevention, prognosis = EXCLUDED.prognosis, is_zoonotic = EXCLUDED.is_zoonotic,
       references_list = EXCLUDED.references_list, updated_at = NOW()
     RETURNING id`,
    [d.name, scientificName, species, d.category, d.severity, d.description,
     JSON.stringify(keySigns), JSON.stringify(diagnosis), JSON.stringify(treatment),
     JSON.stringify(prevention), prognosis, d.is_zoonotic || false, JSON.stringify(references)]
  );

  return result.rowCount! > 0;
}

async function seed() {
  console.log('════════════════════════════════════════════');
  console.log('🏥 VetCloud Disease Library Seed (Direct DB)');
  console.log('════════════════════════════════════════════');
  console.log(`📚 ${ALL_DISEASES.length} diseases from master data`);
  console.log(`  Dogs: ${ALL_DISEASES.filter(d => d.species === 'dog').length}`);
  console.log(`  Cats: ${ALL_DISEASES.filter(d => d.species === 'cat').length}`);
  console.log('');

  let created = 0, skipped = 0;
  for (const d of ALL_DISEASES) {
    try {
      const ok = await upsertDisease(d);
      if (ok) { created++; console.log(`  ✓ ${d.name}`); }
      else { skipped++; console.log(`  ⏭ ${d.name} (updated)`); }
    } catch (err: any) {
      console.error(`  ✗ ${d.name}: ${err.message}`);
    }
  }

  console.log('');
  console.log(`════════════════════════════════════════════`);
  console.log(`✓ Done! Created: ${created}, Updated: ${skipped}`);
  console.log(`════════════════════════════════════════════`);

  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
