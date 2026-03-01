import 'dotenv/config';
import { Pool } from 'pg';

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  fail('Missing DATABASE_URL');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const sql = `
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  target TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  ip TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS id TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_id TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_email TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_role TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS target TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'success';
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS details JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
`;

async function main() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running audit migration...');
    await client.query('BEGIN');
    await client.query(sql);

    await client.query(`
      UPDATE audit_logs
      SET id = CONCAT('al_', gen_random_uuid()::text)
      WHERE id IS NULL OR id = ''
    `).catch(async () => {
      // fallback if pgcrypto extension is unavailable
      await client.query(`
        UPDATE audit_logs
        SET id = CONCAT('al_', md5(random()::text || clock_timestamp()::text))
        WHERE id IS NULL OR id = ''
      `);
    });

    await client.query(`
      ALTER TABLE audit_logs
      ALTER COLUMN id SET NOT NULL
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'audit_logs_pkey'
        ) THEN
          ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);
        END IF;
      END
      $$;
    `);

    await client.query('COMMIT');

    const { rows } = await client.query(
      `SELECT column_name, data_type
       FROM information_schema.columns
       WHERE table_name = 'audit_logs'
       ORDER BY ordinal_position`
    );

    console.log('✅ Audit migration completed.');
    console.log('📋 audit_logs columns:');
    for (const r of rows) {
      console.log(` - ${r.column_name} (${r.data_type})`);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(async (err) => {
  console.error('❌ Unexpected error:', err.message);
  await pool.end();
  process.exit(1);
});
