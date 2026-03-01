import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

let inited = false;

export const defaultLanding = {
  theme: {
    fontFamily: "Lato, Inter, Arial, sans-serif",
    bgColor: "#f3f6fb",
    textColor: "#101828",
    mutedColor: "#606d84",
    primaryColor: "#2f9ae0",
    secondaryColor: "#dab772",
    badgeBorderFrom: "#61C9FF",
    badgeBorderTo: "#82D4FF",
    iconGradFrom: "#2B9EDA",
    iconGradTo: "#1A7EBF",
    titleGradFrom: "#2B9EDA",
    titleGradTo: "#82D4FF",
    navTextColor: "#364152",
    focusBg: "#EAF1FA",
    sectionBg: "#ffffff",
    cardBorder: "#b7d8f0",
    cardHoverShadow: "4px 4px 14px #1992D242",
    statsBg: "#1e3a8a",
    footerBg: "#0A0F1E",
    footerText: "#cdd9ef",
    heroOverlayFrom: "rgba(255,255,255,.58)",
    heroOverlayTo: "rgba(243,246,251,.68)",
  },
  content: {
    nav1: "Home",
    nav2: "About Us",
    nav3: "Expertise",
    nav4: "Research",
    nav5: "Team",
    nav6: "News",
    navCta: "Contact Us",
    heroBadge: "FINTECH RESEARCH CENTER",
    titlePrefix: "Welcome to",
    titleHighlight: "TrustXLabs!",
    title: "Welcome to TrustXLabs!",
    subtitle: "TrustXLabs – a research center for fintech under TRUSTpay Group. The center is invested in focusing on research and development of financial technology solutions based on <strong>AI</strong>, <strong>IoT</strong>, <strong>Big Data</strong> and <strong>Blockchain</strong> to assist users in optimizing the efficiency of financial investment transactions and related services.",
    cta: "Learn More",
    cta2: "Our Research",
    chip1: "AI",
    chip2: "IoT",
    chip3: "Big Data",
    chip4: "Blockchain",

    goalsTitle: "Goals & Mission",
    goalsSubtitle: "TrustXLabs aims to become the leading fintech research company in Vietnam.",
    goal1Title: "Goals",
    goal1Desc: "Editable fintech mission text for goals.",
    goal2Title: "Mission",
    goal2Desc: "Editable fintech mission text for mission.",
    goal3Title: "Commitment",
    goal3Desc: "Editable fintech mission text for commitment.",
    goal4Title: "Vision",
    goal4Desc: "Editable fintech mission text for vision.",

    functionsTitle: "Functions And Missions",
    function1: "Research and develop fintech solutions for practical use.",
    function2: "Provide advanced tools for secure online finance.",
    function3: "Integrate AI, IoT, Big Data and Blockchain.",
    function4: "Collaborate with partners and experts globally.",
    function5: "Collaborate with international partners and organizations to research and develop global financial technology solutions.",
    function6: "Create an environment of innovation and creativity to encourage talented researchers and engineers to build breakthrough fintech products.",

    focusTitle: "Key Focus Areas",
    focus1Label: "PAYMENT SYSTEM",
    focus1Title: "Safe And Convenient Online Payment System",
    focus1Desc: "TrustXLabs will research and develop online payment systems that are safe, convenient and meet user needs.",
    focus2Label: "FINANCIAL PRODUCTS",
    focus2Title: "New Financial Products",
    focus2Desc: "TrustXLabs focuses on digital asset, voucher and online finance products for growing customer demand.",
    focus3Label: "NEW TECHNOLOGY",
    focus3Title: "New Technology",
    focus3Desc: "TrustXLabs integrates Blockchain, AI and Big Data into effective financial solutions.",
    focus4Label: "BLOCKCHAIN & SECURITY",
    focus4Title: "Blockchain In Finance",
    focus4Desc: "TrustXLabs focuses on blockchain research to build advanced financial technology solutions.",

    researchTitle: "Main Research Directions",
    timeline1Title: "Identity Verification",
    timeline1Desc: "Research direction detail for identity verification.",
    timeline2Title: "Core Banking",
    timeline2Desc: "Research direction detail for core banking.",
    timeline3Title: "New Financial Products",
    timeline3Desc: "Research direction detail for financial products.",
    timeline4Title: "E-Wallet",
    timeline4Desc: "Research direction detail for e-wallet.",
    timeline5Title: "Advanced Technology",
    timeline5Desc: "Research direction detail for advanced technology.",

    stat1Value: "5+",
    stat1Label: "Years of experience",
    stat2Value: "20+",
    stat2Label: "Research projects",
    stat3Value: "50+",
    stat3Label: "Experts",
    stat4Value: "100+",
    stat4Label: "International partners",

    contactTitle: "Connect With TrustXLabs",
    heroVideoUrl: "/videos/GettyImages-1308346105.mp4",
    footerBgImageUrl: "/images/Background-footer.png",
    formTitle: "Get In Touch With Us",
    firstNamePlaceholder: "First Name",
    lastNamePlaceholder: "Last Name",
    emailPlaceholder: "Email",
    messagePlaceholder: "Comment Or Message",
    submitText: "Submit",
    addressTitle: "Address",
    addressText: "81 Ky Vong Vien, An Khanh, Ninh Kieu, Can Tho",
    phoneTitle: "Phone",
    phoneText: "+84 76 875 6969",
    supportEmailTitle: "Email",
    supportEmailText: "contact@trustxlabs.com",
    workTimeTitle: "Work Time",
    workTimeText: "Monday – Saturday: 8:00 AM – 5:30 PM",

    footerText: "Vietnam leading financial technology research center under TRUSTpay Group",
    footerCol2Title: "Important Links",
    footerCol2Text: "Customer Spotlight\nCustomer Spotlight\nCustomer Service\nFAQ",
    footerCol3Title: "Company",
    footerCol3Text: "",
    footerCol4Title: "Contact",
    footerCol4Text: "contact@trustxlabs.com\n+84 76 895 6868\n81 Nguyen Hien, An Khanh, Can Tho",
  },
};

export const defaultSettings = {
  identity: {
    siteTitle: "NextCMS",
    siteTagline: "Modern CMS",
    logoUrl: "",
    faviconUrl: "",
  },
  seo: {
    metaTitle: "NextCMS",
    metaDescription: "Modern CMS with theme/content configuration",
    metaKeywords: "cms,nextjs,seo",
    ogImage: "",
    socialPreviewImage: "",
  },
  smtp: {
    host: "",
    port: "587",
    secure: "false",
    user: "",
    pass: "",
    fromEmail: "",
    fromName: "NextCMS",
    toEmail: "",
  },
  security: {
    maxLoginAttempts: "5",
    loginBlockMinutes: "30",
    maxContactPerHour: "20",
  },
};

export const defaultMedia = [
  { id: "m_hero_video", url: "/videos/GettyImages-1308346105.mp4", name: "Hero Background Video", alt: "", type: "video", createdAt: new Date().toISOString() },
  { id: "m_footer_bg", url: "/images/Background-footer.png", name: "Footer Background", alt: "", type: "image", createdAt: new Date().toISOString() }
];

async function upsertKey(key, value) {
  await pool.query(
    `INSERT INTO site_content (key, value, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
    [key, JSON.stringify(value)]
  );
}

async function getKey(key, fallback) {
  const { rows } = await pool.query("SELECT value FROM site_content WHERE key=$1 LIMIT 1", [key]);
  return rows[0]?.value || fallback;
}

export async function ensureSchema() {
  if (inited) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contact_submissions (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS auth_attempts (
      id TEXT PRIMARY KEY,
      email TEXT,
      ip TEXT,
      success BOOLEAN NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

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

    ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

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
  `);

  await upsertKey("landing", await getKey("landing", defaultLanding));
  await upsertKey("settings", await getKey("settings", defaultSettings));
  await upsertKey("media", await getKey("media", defaultMedia));

  inited = true;
}

export async function getLanding() {
  await ensureSchema();
  const data = await getKey("landing", defaultLanding);

  const baseContent = { ...defaultLanding.content, ...(data.content || {}) };
  const contentI18n = {
    en: { ...baseContent, ...(data.contentI18n?.en || {}) },
    vi: { ...baseContent, ...(data.contentI18n?.vi || {}) },
  };

  return {
    theme: { ...defaultLanding.theme, ...(data.theme || {}) },
    content: baseContent,
    contentI18n,
  };
}

export async function saveLanding(value) {
  await ensureSchema();
  await upsertKey("landing", value);
}

export async function getSettings() {
  await ensureSchema();
  const data = await getKey("settings", defaultSettings);
  return {
    identity: { ...defaultSettings.identity, ...(data.identity || {}) },
    seo: { ...defaultSettings.seo, ...(data.seo || {}) },
    smtp: { ...defaultSettings.smtp, ...(data.smtp || {}) },
    security: { ...defaultSettings.security, ...(data.security || {}) },
  };
}

export async function saveSettings(value) {
  await ensureSchema();
  await upsertKey("settings", value);
}

export async function getMedia() {
  await ensureSchema();
  return getKey("media", defaultMedia);
}

export async function saveMedia(value) {
  await ensureSchema();
  await upsertKey("media", value);
}

export async function findUserByEmail(email) {
  await ensureSchema();
  const { rows } = await pool.query("SELECT * FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1", [email]);
  return rows[0] || null;
}

export async function listUsers() {
  await ensureSchema();
  const { rows } = await pool.query("SELECT id,name,email,role,status,created_at,updated_at FROM users ORDER BY created_at ASC");
  return rows;
}

export async function createUser(user) {
  await ensureSchema();
  await pool.query(
    "INSERT INTO users (id,name,email,password_hash,role,status,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())",
    [user.id, user.name, user.email, user.passwordHash, user.role || "admin", user.status || "active"]
  );
}

export async function updateUserStatus(id, status) {
  await ensureSchema();
  await pool.query("UPDATE users SET status=$2, updated_at=NOW() WHERE id=$1", [id, status]);
}

export async function deleteUser(id) {
  await ensureSchema();
  await pool.query("DELETE FROM users WHERE id=$1", [id]);
}

export async function countSuperAdmins() {
  await ensureSchema();
  const { rows } = await pool.query("SELECT COUNT(*)::int AS c FROM users WHERE role='super_admin'");
  return rows[0]?.c || 0;
}

export async function saveContactSubmission({ id, firstName, lastName, email, message }) {
  await ensureSchema();
  await pool.query(
    `INSERT INTO contact_submissions (id, first_name, last_name, email, message, status, created_at)
     VALUES ($1,$2,$3,$4,$5,'new',NOW())`,
    [id, firstName, lastName, email, message]
  );
}

export async function listContactSubmissions() {
  await ensureSchema();
  const { rows } = await pool.query(
    "SELECT id, first_name, last_name, email, message, status, created_at FROM contact_submissions ORDER BY created_at DESC LIMIT 500"
  );
  return rows;
}

export async function updateContactSubmissionStatus(id, status) {
  await ensureSchema();
  await pool.query("UPDATE contact_submissions SET status=$2 WHERE id=$1", [id, status]);
}

export async function countRecentContacts(hours = 1) {
  await ensureSchema();
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS c FROM contact_submissions WHERE created_at > NOW() - ($1 || ' hours')::interval",
    [String(hours)]
  );
  return rows[0]?.c || 0;
}

export async function recordAuthAttempt({ id, email, ip, success }) {
  await ensureSchema();
  await pool.query(
    "INSERT INTO auth_attempts (id,email,ip,success,created_at) VALUES ($1,$2,$3,$4,NOW())",
    [id, email || null, ip || null, !!success]
  );
}

export async function countRecentFailedAttempts(email, minutes = 30) {
  await ensureSchema();
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS c FROM auth_attempts
     WHERE LOWER(email)=LOWER($1) AND success=false AND created_at > NOW() - ($2 || ' minutes')::interval`,
    [email || "", String(minutes)]
  );
  return rows[0]?.c || 0;
}

export async function createAuditLog({ actorId, actorEmail, actorRole, action, target, status = "success", ip, userAgent, details }) {
  await ensureSchema();
  await pool.query(
    `INSERT INTO audit_logs (id, actor_id, actor_email, actor_role, action, target, status, ip, user_agent, details, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,NOW())`,
    [
      `al_${crypto.randomUUID()}`,
      actorId || null,
      actorEmail || null,
      actorRole || null,
      action,
      target || null,
      status,
      ip || null,
      userAgent || null,
      details ? JSON.stringify(details) : null,
    ]
  );
}

export async function listAuditLogs(limit = 300) {
  await ensureSchema();
  const safeLimit = Math.max(1, Math.min(Number(limit) || 300, 1000));
  try {
    const { rows } = await pool.query(
      `SELECT id, actor_id, actor_email, actor_role, action, target, status, ip, user_agent, details, created_at
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT $1`,
      [safeLimit]
    );
    return rows;
  } catch {
    // older schema or unavailable columns
    return [];
  }
}

export async function exportBackupData() {
  await ensureSchema();
  const [users, siteContent, contacts, attempts] = await Promise.all([
    pool.query("SELECT id,name,email,role,status,created_at,updated_at FROM users ORDER BY created_at ASC"),
    pool.query("SELECT key,value,updated_at FROM site_content ORDER BY key ASC"),
    pool.query("SELECT id,first_name,last_name,email,message,status,created_at FROM contact_submissions ORDER BY created_at DESC"),
    pool.query("SELECT id,email,ip,success,created_at FROM auth_attempts ORDER BY created_at DESC LIMIT 5000"),
  ]);

  let auditLogs = [];
  try {
    const r = await pool.query("SELECT id,actor_id,actor_email,actor_role,action,target,status,ip,user_agent,details,created_at FROM audit_logs ORDER BY created_at DESC LIMIT 20000");
    auditLogs = r.rows;
  } catch {
    // keep backup working even when audit schema is old/missing
    auditLogs = [];
  }

  return {
    exportedAt: new Date().toISOString(),
    users: users.rows,
    siteContent: siteContent.rows,
    contactSubmissions: contacts.rows,
    authAttempts: attempts.rows,
    auditLogs,
  };
}

export { pool };
