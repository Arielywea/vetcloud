const { Client } = require('../node_modules/pg');

async function main() {
  const c = new Client({
    connectionString: 'postgresql://neondb_owner:npg_THFGcfaW5M7h@ep-aged-river-ac7edlxd-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
  });
  await c.connect();
  console.log('Connected to Neon DB');

  // Step 1: Add pet_id column
  console.log('\n--- Step 1: Add pet_id column ---');
  try {
    await c.query('ALTER TABLE appointments ADD COLUMN pet_id UUID REFERENCES pets(id) ON DELETE SET NULL');
    console.log('Column pet_id added successfully');
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log('Column pet_id already exists');
    } else {
      console.error('Error adding column:', e.message);
    }
  }

  // Step 2: Check current appointments
  console.log('\n--- Step 2: Current appointments ---');
  const appts = await c.query('SELECT id, patient_name, pet_id FROM appointments');
  console.log('Appointments:', JSON.stringify(appts.rows, null, 2));

  // Step 3: Check current pets
  console.log('\n--- Step 3: Current pets ---');
  const pets = await c.query('SELECT id, name FROM pets');
  console.log('Pets:', JSON.stringify(pets.rows, null, 2));

  // Step 4: Try to match appointments to pets by name
  console.log('\n--- Step 4: Match appointments to pets ---');
  for (const appt of appts.rows) {
    const patientLower = appt.patient_name.toLowerCase().trim();
    const match = pets.rows.find(p => p.name.toLowerCase().trim() === patientLower);
    if (match) {
      console.log(`  "${appt.patient_name}" -> matches pet "${match.name}" (${match.id})`);
      await c.query('UPDATE appointments SET pet_id = $1 WHERE id = $2', [match.id, appt.id]);
      console.log(`  Updated appointment ${appt.id} with pet_id ${match.id}`);
    } else {
      console.log(`  "${appt.patient_name}" -> NO MATCH FOUND`);
    }
  }

  // Step 5: Verify
  console.log('\n--- Step 5: Verify ---');
  const final = await c.query('SELECT a.id, a.patient_name, a.pet_id, p.name as pet_name FROM appointments a LEFT JOIN pets p ON a.pet_id = p.id');
  console.log('Final state:', JSON.stringify(final.rows, null, 2));

  await c.end();
  console.log('\nDone!');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
