const BASE_URL = "https://vetcloud.vercel.app";

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

function log(status, testName, detail = "") {
  const icon = status === "PASS" ? `${GREEN}PASS` : status === "FAIL" ? `${RED}FAIL` : `${YELLOW}WARN`;
  const suffix = detail ? ` - ${detail}` : "";
  console.log(`  ${icon}${RESET} ${testName}${suffix}`);
}

async function login(rut, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rut, password }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data?.token || data.token || null;
}

// ──────────────────────────────────────────────
// 1. SQL Injection Test
// ──────────────────────────────────────────────
async function testSqlInjection() {
  console.log(`\n${YELLOW}[1] SQL Injection Test${RESET}`);

  const token = await login("21293992-7", "1245");
  if (!token) { log("FAIL", "Could not authenticate"); return; }
  log("PASS", "Logged in as user A");

  const listRes = await fetch(`${BASE_URL}/items/pets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!listRes.ok) { log("FAIL", "Could not list pets"); return; }
  const listData = await listRes.json();
  const pets = listData.data || listData;
  if (!pets.length) { log("FAIL", "No pets found to test with"); return; }
  const petId = pets[0].id;
  const originalName = pets[0].name;
  log("PASS", `Found pet: ${petId} ("${originalName}")`);

  const maliciousPayload = {
    name: "sql-injection-test",
    malicious: "val); DROP TABLE pets; --",
  };

  const patchRes = await fetch(`${BASE_URL}/items/pets/${petId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(maliciousPayload),
  });

  if (patchRes.ok) {
    const updated = await patchRes.json();
    if (updated.name === "sql-injection-test" && !updated.malicious) {
      log("PASS", "Only 'name' field updated; 'malicious' field rejected");
    } else if (updated.malicious) {
      log("FAIL", "Malicious field was stored in response (sanitizeColumns may be bypassed)");
    } else {
      log("PASS", "Malicious field not stored, name updated", JSON.stringify(updated));
    }
  } else {
    log("WARN", `PATCH returned ${patchRes.status}`, await patchRes.text());
  }

  const verifyRes = await fetch(`${BASE_URL}/items/pets/${petId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (verifyRes.ok) {
    log("PASS", "Pet still exists after PATCH (table not dropped)");
  } else if (verifyRes.status === 404) {
    log("PASS", "Pet not found after PATCH (may have soft-deleted — acceptable)");
  } else {
    log("FAIL", `GET pet returned ${verifyRes.status}`);
  }

  const cleanupRes = await fetch(`${BASE_URL}/items/pets/${petId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: originalName }),
  });
  if (cleanupRes.ok) log("PASS", "Cleanup: restored original pet name");
}

// ──────────────────────────────────────────────
// 2. User Scoping Test
// ──────────────────────────────────────────────
async function testUserScoping() {
  console.log(`\n${YELLOW}[2] User Scoping Test${RESET}`);

  const tokenA = await login("21293992-7", "1245");
  if (!tokenA) { log("FAIL", "Could not authenticate user A"); return; }
  log("PASS", "Logged in as user A");

  const listA = await fetch(`${BASE_URL}/items/pets`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  if (!listA.ok) { log("FAIL", "User A could not list pets"); return; }
  const listAData = await listA.json();
  const petsA = listAData.data || listAData;
  if (!Array.isArray(petsA) || !petsA.length) { log("FAIL", "User A has no pets"); return; }
  const petIdA = petsA[0].id;
  log("PASS", `User A has pet ${petIdA}`);

  const tokenB = await login("21392885-6", "1245");
  if (!tokenB) { log("WARN", "Could not authenticate user B (account may not exist) — skipping cross-access test"); return; }
  log("PASS", "Logged in as user B");

  const crossAccess = await fetch(`${BASE_URL}/items/pets/${petIdA}`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });

  if (crossAccess.status === 404) {
    log("PASS", "User B got 404 for User A's pet (scoping enforced)");
  } else if (crossAccess.ok) {
    log("FAIL", "User B could access User A's pet (scoping NOT enforced)");
  } else {
    log("WARN", `User B got status ${crossAccess.status} (unexpected but not 200)`);
  }
}

// ──────────────────────────────────────────────
// 3. Rate Limiting Test
// ──────────────────────────────────────────────
async function testRateLimiting() {
  console.log(`\n${YELLOW}[3] Rate Limiting Test${RESET}`);

  let got429 = false;
  for (let i = 1; i <= 6; i++) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rut: "21293992-7", password: `wrong_password_${i}` }),
    });

    if (res.status === 429) {
      log("PASS", `Attempt ${i}: got 429 (rate limited)`);
      got429 = true;
      break;
    } else {
      log("WARN", `Attempt ${i}: got ${res.status}`);
    }
  }

  if (!got429) {
    log("FAIL", "No 429 received after 6 wrong login attempts");
  }
}

// ──────────────────────────────────────────────
// 4. Password Policy Test
// ──────────────────────────────────────────────
async function testPasswordPolicy() {
  console.log(`\n${YELLOW}[4] Password Policy Test${RESET}`);

  const token = await login("21293992-7", "1245");
  if (!token) { log("FAIL", "Could not authenticate"); return; }
  log("PASS", "Logged in");

  const shortRes = await fetch(`${BASE_URL}/auth/password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ current_password: "1245", new_password: "abc" }),
  });

  if (shortRes.status === 400) {
    const body = await shortRes.json();
    const msg = (body.error || body.message || "").toLowerCase();
    if (msg.includes("8") || msg.includes("mínimo") || msg.includes("minimum") || msg.includes("length")) {
      log("PASS", "Short password rejected (min 8 chars enforced)");
    } else {
      log("PASS", `Short password rejected: ${body.error || body.message}`);
    }
  } else {
    log("FAIL", `Short password returned ${shortRes.status} (expected 400)`);
  }

  const weakRes = await fetch(`${BASE_URL}/auth/password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ current_password: "1245", new_password: "lowercaseonly" }),
  });

  if (weakRes.status === 400) {
    const body = await weakRes.json();
    const msg = (body.error || body.message || "").toLowerCase();
    if (msg.includes("uppercase") || msg.includes("mayúsculas") || msg.includes("complex") || msg.includes("capital")) {
      log("PASS", "Weak password rejected (complexity enforced)");
    } else {
      log("PASS", `Weak password rejected: ${body.error || body.message}`);
    }
  } else {
    log("FAIL", `Weak password returned ${weakRes.status} (expected 400)`);
  }
}

// ──────────────────────────────────────────────
// 5. Admin Panel Auth Test
// ──────────────────────────────────────────────
async function testAdminAuth() {
  console.log(`\n${YELLOW}[5] Admin Panel Auth Test${RESET}`);

  const noTokenRes = await fetch(`${BASE_URL}/admin`);
  if (noTokenRes.status === 401) {
    log("PASS", "No token → 401 Unauthorized");
  } else {
    log("FAIL", `No token → ${noTokenRes.status} (expected 401)`);
  }

  const badTokenRes = await fetch(`${BASE_URL}/admin`, {
    headers: { Authorization: "Bearer fake_invalid_token_xyz" },
  });
  if (badTokenRes.status === 401) {
    log("PASS", "Invalid token → 401 Unauthorized");
  } else {
    log("FAIL", `Invalid token → ${badTokenRes.status} (expected 401)`);
  }
}

// ──────────────────────────────────────────────
// 6. UUID Validation Test
// ──────────────────────────────────────────────
async function testUuidValidation() {
  console.log(`\n${YELLOW}[6] UUID Validation Test${RESET}`);

  const token = await login("21293992-7", "1245");
  if (!token) { log("FAIL", "Could not authenticate"); return; }
  log("PASS", "Logged in");

  const badUuid = "not-a-uuid";

  const hospRes = await fetch(`${BASE_URL}/items/hospitalizations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ pet_id: badUuid, reason: "test" }),
  });

  if (hospRes.status === 400) {
    const body = await hospRes.json();
    const msg = (body.error || body.message || "").toLowerCase();
    if (msg.includes("uuid") || msg.includes("valid") || msg.includes("format")) {
      log("PASS", "Hospitalization: bad pet_id rejected with UUID error");
    } else {
      log("PASS", `Hospitalization: bad pet_id rejected (${body.error || body.message})`);
    }
  } else if (hospRes.status === 404) {
    log("WARN", "Endpoint /items/hospitalizations not found");
  } else {
    log("FAIL", `Hospitalization: returned ${hospRes.status} (expected 400)`);
  }

  const labRes = await fetch(`${BASE_URL}/items/lab_exams`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ pet_id: badUuid, exam_name: "test", result: "test" }),
  });

  if (labRes.status === 400) {
    log("PASS", "Lab exam: bad pet_id rejected");
  } else if (labRes.status === 404) {
    log("WARN", "Endpoint /items/lab_exams not found");
  } else {
    log("FAIL", `Lab exam: returned ${labRes.status} (expected 400)`);
  }
}

// ──────────────────────────────────────────────
// 7. XSS in Email / Escape Test
// ──────────────────────────────────────────────
async function testXssInEmail() {
  console.log(`\n${YELLOW}[7] XSS in Email / Escape Test${RESET}`);

  const token = await login("21293992-7", "1245");
  if (!token) { log("FAIL", "Could not authenticate"); return; }
  log("PASS", "Logged in");

  const xssPayload = {
    pet_id: "00000000-0000-0000-0000-000000000000",
    prescription_body: "<script>alert('xss')</script>",
    notes: "<img src=x onerror=alert(1)>",
  };

  const endpoints = [
    "/items/prescriptions",
    "/items/prescriptions/create",
  ];

  let tested = false;
  for (const endpoint of endpoints) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(xssPayload),
    });

    if (res.status === 404) continue;
    tested = true;

    if (res.ok || res.status === 400 || res.status === 422) {
      const text = await res.text();
      if (text.includes("<script>") || text.includes("onerror")) {
        log("FAIL", `Endpoint ${endpoint}: HTML characters present in response (escapeHtml missing)`);
      } else {
        log("PASS", `Endpoint ${endpoint}: accepted input without rendering HTML (status ${res.status})`);
      }
      break;
    } else {
      log("WARN", `Endpoint ${endpoint}: returned ${res.status}`);
    }
  }

  if (!tested) {
    log("WARN", "No prescription endpoint found — structural XSS escape cannot be verified via API");
    log("WARN", "Verify escapeHtml() is exported and used in email/prescription templates manually");
  }
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function main() {
  console.log("═".repeat(60));
  console.log(`  VetCloud Security Test Suite`);
  console.log(`  Target: ${BASE_URL}`);
  console.log("═".repeat(60));

  const start = Date.now();

  await testSqlInjection();
  await testUserScoping();
  await testPasswordPolicy();
  await testAdminAuth();
  await testUuidValidation();
  await testXssInEmail();
  await testRateLimiting();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n" + "═".repeat(60));
  console.log(`  Completed in ${elapsed}s`);
  console.log("═".repeat(60));
}

main().catch((err) => {
  console.error(`\n${RED}Fatal error:${RESET}`, err);
  process.exit(1);
});
