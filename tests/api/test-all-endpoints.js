const BASE = 'https://vetcloud.vercel.app';
let token = null;
let petId = null;
let appointmentId = null;
let hospitalizationId = null;
let labExamId = null;
let inventoryId = null;
let noteId = null;
let passed = 0;
let failed = 0;

const log = (label, ok) => {
  if (ok) { passed++; console.log(`  \x1b[32m✓ PASS\x1b[0m ${label}`); }
  else { failed++; console.log(`  \x1b[31m✗ FAIL\x1b[0m ${label}`); }
};

async function req(method, path, body = null, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`${BASE}${path}`, opts);
  const json = await r.json().catch(() => null);
  return { status: r.status, json };
}

async function test(label, expectedStatus, fn) {
  try {
    const { status, json } = await fn();
    const ok = status === expectedStatus;
    log(`${label} (${status})`, ok);
    if (!ok) console.log(`    expected ${expectedStatus}, got ${status}`);
    return { ok, status, json };
  } catch (e) {
    log(`${label} (ERROR: ${e.message})`, false);
    return { ok: false, status: 0, json: null };
  }
}

async function run() {
  console.log('\n\x1b[1mVetCloud API Tests\x1b[0m\n');

  // ── Auth ──
  console.log('\x1b[1mAuth\x1b[0m');
  await test('POST /auth/login (valid)', 200, async () => {
    const r = await req('POST', '/auth/login', { rut: '21293992-7', password: '1245' }, false);
    token = r.json?.data?.token || r.json?.token;
    return r;
  });
  await test('POST /auth/login (invalid)', 401, () => req('POST', '/auth/login', { rut: '21293992-7', password: 'wrong' }, false));
  await test('GET /auth/me', 200, () => req('GET', '/auth/me'));

  // ── Pets ──
  console.log('\n\x1b[1mPets\x1b[0m');
  await test('GET /items/pets', 200, () => req('GET', '/items/pets'));
  await test('POST /items/pets', 200, async () => {
    const r = await req('POST', '/items/pets', { name: 'Test Pet', species: 'dog', breed: 'Mestizo' });
    petId = r.json?.data?.id || r.json?.id;
    return r;
  });
  if (petId) {
    await test(`GET /items/pets/${petId}`, 200, () => req('GET', `/items/pets/${petId}`));
    await test(`PATCH /items/pets/${petId}`, 200, () => req('PATCH', `/items/pets/${petId}`, { name: 'Test Pet Updated' }));
    await test(`DELETE /items/pets/${petId}`, 200, () => req('DELETE', `/items/pets/${petId}`));
  }

  // ── Diseases ──
  console.log('\n\x1b[1mDiseases\x1b[0m');
  const diseases = await test('GET /items/diseases', 200, () => req('GET', '/items/diseases'));
  if (diseases.ok) {
    const list = diseases.json?.data || diseases.json;
    const count = Array.isArray(list) ? list.length : 0;
    log(`  → returned ${count} diseases`, count >= 87);
    if (count >= 87) passed++; else failed++;
  }
  await test('GET /items/diseases?species=dog', 200, () => req('GET', '/items/diseases?species=dog'));
  await test('GET /items/diseases?search=parvovirus', 200, () => req('GET', '/items/diseases?search=parvovirus'));

  // ── Appointments ──
  console.log('\n\x1b[1mAppointments\x1b[0m');
  await test('GET /items/appointments', 200, () => req('GET', '/items/appointments'));
  await test('POST /items/appointments', 200, async () => {
    const r = await req('POST', '/items/appointments', {
      patient_name: 'Test Patient',
      start_time: new Date().toISOString(),
      appointment_type: 'consulta',
      description: 'API test'
    });
    appointmentId = r.json?.data?.id || r.json?.id;
    return r;
  });
  if (appointmentId) {
    await test(`PATCH /items/appointments/${appointmentId}`, 200, () =>
      req('PATCH', `/items/appointments/${appointmentId}`, { status: 'completed' }));
    await test(`DELETE /items/appointments/${appointmentId}`, 200, () =>
      req('DELETE', `/items/appointments/${appointmentId}`));
  }

  // ── Hospitalizations ──
  console.log('\n\x1b[1mHospitalizations\x1b[0m');
  // Create a pet for hospitalization (since test pet was deleted)
  let hospPetId = null;
  const hospPet = await req('POST', '/items/pets', { name: 'Hosp Test Pet', species: 'dog' });
  hospPetId = hospPet.json?.data?.id || hospPet.json?.id;
  await test('GET /items/hospitalizations', 200, () => req('GET', '/items/hospitalizations'));
  await test('POST /items/hospitalizations', 200, async () => {
    const r = await req('POST', '/items/hospitalizations', {
      pet_id: hospPetId,
      reason: 'API test hospitalization',
      status: 'internado'
    });
    hospitalizationId = r.json?.data?.id || r.json?.id;
    return r;
  });
  if (hospitalizationId) {
    await test(`PATCH /items/hospitalizations/${hospitalizationId}`, 200, () =>
      req('PATCH', `/items/hospitalizations/${hospitalizationId}`, { status: 'discharged' }));
    await test(`DELETE /items/hospitalizations/${hospitalizationId}`, 200, () =>
      req('DELETE', `/items/hospitalizations/${hospitalizationId}`));
  }
  // Cleanup hosp pet
  if (hospPetId) await req('DELETE', `/items/pets/${hospPetId}`);

  // ── Lab Exams ──
  console.log('\n\x1b[1mLab Exams\x1b[0m');
  // Create a pet for lab exams
  let labPetId = null;
  const labPet = await req('POST', '/items/pets', { name: 'Lab Test Pet', species: 'cat' });
  labPetId = labPet.json?.data?.id || labPet.json?.id;
  await test('GET /items/lab_exams', 200, () => req('GET', '/items/lab_exams'));
  await test('POST /items/lab_exams', 200, async () => {
    const r = await req('POST', '/items/lab_exams', {
      pet_id: labPetId,
      exam_name: 'Hemograma completo',
      exam_type: 'hemograma',
      status: 'pendiente'
    });
    labExamId = r.json?.data?.id || r.json?.id;
    return r;
  });
  if (labExamId) {
    await test(`PATCH /items/lab_exams/${labExamId}`, 200, () =>
      req('PATCH', `/items/lab_exams/${labExamId}`, { status: 'completado', result: 'Resultado normal' }));
    await test(`DELETE /items/lab_exams/${labExamId}`, 200, () =>
      req('DELETE', `/items/lab_exams/${labExamId}`));
  }
  // Cleanup lab pet
  if (labPetId) await req('DELETE', `/items/pets/${labPetId}`);

  // ── Stats ──
  console.log('\n\x1b[1mStats\x1b[0m');
  await test('GET /stats/dashboard', 200, () => req('GET', '/stats/dashboard'));
  await test('GET /stats/weekly', 200, () => req('GET', '/stats/weekly'));
  await test('GET /stats/record-types', 200, () => req('GET', '/stats/record-types'));

  // ── Inventory ──
  console.log('\n\x1b[1mInventory\x1b[0m');
  await test('GET /items/inventory', 200, () => req('GET', '/items/inventory'));
  await test('POST /items/inventory', 200, async () => {
    const r = await req('POST', '/items/inventory', { name: 'API Test Item', quantity: 10, unit: 'unit' });
    inventoryId = r.json?.id || r.json?.data?.id;
    return r;
  });
  if (inventoryId) {
    await test(`DELETE /items/inventory/${inventoryId}`, 200, () => req('DELETE', `/items/inventory/${inventoryId}`));
  }

  // ── Clinical Records ──
  console.log('\n\x1b[1mClinical Records\x1b[0m');
  await test('GET /items/clinical_records', 200, () => req('GET', '/items/clinical_records'));

  // ── Notes ──
  console.log('\n\x1b[1mPersonal Notes\x1b[0m');
  await test('GET /items/personal_notes', 200, () => req('GET', '/items/personal_notes'));
  await test('POST /items/personal_notes', 200, async () => {
    const r = await req('POST', '/items/personal_notes', { title: 'API Test Note', content: 'Test content' });
    noteId = r.json?.id || r.json?.data?.id;
    return r;
  });
  if (noteId) {
    await test(`DELETE /items/personal_notes/${noteId}`, 200, () => req('DELETE', `/items/personal_notes/${noteId}`));
  }

  // ── Reminders ──
  console.log('\n\x1b[1mReminders\x1b[0m');
  await test('GET /items/reminders', 200, () => req('GET', '/items/reminders'));

  // ── Prescriptions ──
  console.log('\n\x1b[1mPrescriptions\x1b[0m');
  await test('GET /items/prescriptions', 200, () => req('GET', '/items/prescriptions'));

  // ── Favorites ──
  console.log('\n\x1b[1mFavorites\x1b[0m');
  await test('GET /items/favorites', 200, () => req('GET', '/items/favorites'));

  // ── Summary ──
  const total = passed + failed;
  console.log(`\n\x1b[1m─── Summary ───\x1b[0m`);
  console.log(`Total: ${total}  \x1b[32mPassed: ${passed}\x1b[0m  \x1b[31mFailed: ${failed}\x1b[0m`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
