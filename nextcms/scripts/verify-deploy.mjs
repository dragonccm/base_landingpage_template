import 'dotenv/config';

const baseUrl = (process.env.VERIFY_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const adminEmail = process.env.VERIFY_ADMIN_EMAIL || '';
const adminPassword = process.env.VERIFY_ADMIN_PASSWORD || '';

const cookieJar = new Map();

function setCookiesFromResponse(res) {
  const raw = res.headers.get('set-cookie');
  if (!raw) return;
  const parts = raw.split(/,(?=\s*[^;]+=)/g);
  for (const part of parts) {
    const pair = part.split(';')[0]?.trim();
    if (!pair) continue;
    const idx = pair.indexOf('=');
    if (idx <= 0) continue;
    const name = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    cookieJar.set(name, value);
  }
}

function cookieHeader() {
  return [...cookieJar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}

async function call(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (auth) {
    const c = cookieHeader();
    if (c) headers.cookie = c;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  setCookiesFromResponse(res);

  let data = null;
  try { data = await res.json(); } catch { data = null; }

  return { ok: res.ok, status: res.status, data };
}

const checks = [];

function addCheck(name, passed, detail = '') {
  checks.push({ name, passed, detail });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}${detail ? ` -> ${detail}` : ''}`);
}

async function main() {
  console.log(`🔎 Verify deploy: ${baseUrl}`);

  const publicLanding = await call('/api/landing');
  addCheck('Public API /api/landing', publicLanding.ok, `status=${publicLanding.status}`);

  const publicSettings = await call('/api/settings');
  addCheck('Public API /api/settings', publicSettings.ok, `status=${publicSettings.status}`);

  if (!adminEmail || !adminPassword) {
    console.log('ℹ️ Skip admin checks (missing VERIFY_ADMIN_EMAIL / VERIFY_ADMIN_PASSWORD).');
  } else {
    const login = await call('/api/auth/login', {
      method: 'POST',
      body: { email: adminEmail, password: adminPassword },
    });
    addCheck('Admin login /api/auth/login', login.ok, `status=${login.status}`);

    if (login.ok) {
      const adminLanding = await call('/api/admin/landing', { auth: true });
      addCheck('Admin API /api/admin/landing', adminLanding.ok, `status=${adminLanding.status}`);

      const adminSettings = await call('/api/admin/settings', { auth: true });
      addCheck('Admin API /api/admin/settings', adminSettings.ok, `status=${adminSettings.status}`);

      const backups = await call('/api/admin/backup', { auth: true });
      addCheck('Admin API /api/admin/backup (GET)', backups.ok, `status=${backups.status}`);

      const backupCreate = await call('/api/admin/backup', { method: 'POST', auth: true });
      addCheck('Admin API /api/admin/backup (POST)', backupCreate.ok, `status=${backupCreate.status}`);

      const audit = await call('/api/admin/audit-logs?limit=20', { auth: true });
      addCheck('Admin API /api/admin/audit-logs', audit.ok, `status=${audit.status}`);

      const users = await call('/api/admin/users', { auth: true });
      addCheck('Admin API /api/admin/users', users.ok, `status=${users.status}`);

      await call('/api/auth/logout', { method: 'POST', auth: true });
    }
  }

  const failed = checks.filter((x) => !x.passed);
  console.log('');
  console.log(`📊 Result: ${checks.length - failed.length}/${checks.length} checks passed`);

  if (failed.length) {
    console.log('❌ Failed checks:');
    for (const f of failed) console.log(` - ${f.name} (${f.detail})`);
    process.exit(1);
  }

  console.log('✅ Deployment verification passed.');
}

main().catch((err) => {
  console.error('❌ verify-deploy crashed:', err.message);
  process.exit(1);
});
