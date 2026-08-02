const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const db = new Database(path.join(__dirname, '..', process.env.DB_PATH || './database.sqlite'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('UNIVERSITY', 'STUDENT')),
      register_number TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS universities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      issuer_code TEXT UNIQUE NOT NULL,
      public_key TEXT NOT NULL,
      private_key TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      certificate_number TEXT UNIQUE NOT NULL,
      register_number TEXT NOT NULL,
      student_name TEXT NOT NULL,
      student_email TEXT,
      student_user_id TEXT,
      course TEXT NOT NULL,
      cgpa TEXT,
      start_year TEXT,
      end_year TEXT NOT NULL,
      issue_date TEXT NOT NULL,
      certificate_hash TEXT NOT NULL,
      signature TEXT NOT NULL,
      university_id TEXT NOT NULL,
      file_path TEXT,
      qr_data TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'VALID' CHECK(status IN ('VALID', 'REVOKED')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (university_id) REFERENCES universities(id)
    );

    CREATE TABLE IF NOT EXISTS revoked_certificates (
      id TEXT PRIMARY KEY,
      certificate_id TEXT NOT NULL UNIQUE,
      revoked_by TEXT,
      reason TEXT,
      revoked_at TEXT DEFAULT CURRENT_TIMESTAMP,
      signature TEXT,
      block_number INTEGER,
      tx_id TEXT,
      FOREIGN KEY (certificate_id) REFERENCES certificates(id)
    );

    CREATE INDEX IF NOT EXISTS idx_certificates_register_number ON certificates(register_number);
  `);

  // Migration: add cryptographic columns to revoked_certificates table if missing
  const revokedCols = db.pragma('table_info(revoked_certificates)').map((c) => c.name);
  if (!revokedCols.includes('revoked_by')) {
    try { db.exec('ALTER TABLE revoked_certificates ADD COLUMN revoked_by TEXT;'); } catch (e) {}
    try { db.exec('ALTER TABLE revoked_certificates ADD COLUMN signature TEXT;'); } catch (e) {}
    try { db.exec('ALTER TABLE revoked_certificates ADD COLUMN block_number INTEGER;'); } catch (e) {}
    try { db.exec('ALTER TABLE revoked_certificates ADD COLUMN tx_id TEXT;'); } catch (e) {}
    console.log('Migration: added cryptographic revocation columns to revoked_certificates');
  }

  // Migration: add register_number to users table if it doesn't exist yet
  const userColumns = db.pragma('table_info(users)').map((c) => c.name);
  if (!userColumns.includes('register_number')) {
    db.exec('ALTER TABLE users ADD COLUMN register_number TEXT;');
    console.log('Migration: added register_number column to users table');
  }

  // Wallet events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS wallet_events (
      id TEXT PRIMARY KEY,
      student_user_id TEXT NOT NULL,
      certificate_id TEXT NOT NULL,
      event_type TEXT NOT NULL CHECK(event_type IN ('VIEW','DOWNLOAD','SHARE','VERIFY')),
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_wallet_events_user ON wallet_events(student_user_id);
    CREATE INDEX IF NOT EXISTS idx_wallet_events_cert ON wallet_events(certificate_id);

    CREATE TABLE IF NOT EXISTS verification_events (
      id TEXT PRIMARY KEY,
      university_id TEXT NOT NULL,
      certificate_id TEXT NOT NULL,
      certificate_number TEXT NOT NULL,
      student_name TEXT,
      verifier_org TEXT DEFAULT 'Anonymous Verifier',
      verification_result TEXT NOT NULL,
      verified_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (university_id) REFERENCES universities(id)
    );
    CREATE INDEX IF NOT EXISTS idx_verif_events_uni ON verification_events(university_id);
    CREATE INDEX IF NOT EXISTS idx_verif_events_cert ON verification_events(certificate_id);
  `);

  // Audit log table — safe migration, never modifies existing tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id          TEXT PRIMARY KEY,
      timestamp   TEXT DEFAULT CURRENT_TIMESTAMP,
      user_id     TEXT,
      user_email  TEXT,
      user_name   TEXT,
      role        TEXT,
      module      TEXT NOT NULL,
      action      TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'SUCCESS',
      ip_address  TEXT,
      details     TEXT,
      resource_id TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp   ON audit_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_user_id     ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_module      ON audit_logs(module);
    CREATE INDEX IF NOT EXISTS idx_audit_action      ON audit_logs(action);
  `);

  // Migration: add certificate_category and certificate_detail to certificates table
  const certColumns = db.pragma('table_info(certificates)').map((c) => c.name);
  if (!certColumns.includes('certificate_category')) {
    db.exec("ALTER TABLE certificates ADD COLUMN certificate_category TEXT DEFAULT 'Course Completion Certificate';");
    console.log('Migration: added certificate_category column to certificates table');
  }
  if (!certColumns.includes('certificate_detail')) {
    db.exec("ALTER TABLE certificates ADD COLUMN certificate_detail TEXT DEFAULT '';");
    console.log('Migration: added certificate_detail column to certificates table');
  }

  // Blockchain anchor ledger — append-only, never UPDATE or DELETE
  db.exec(`
    CREATE TABLE IF NOT EXISTS blockchain_anchors (
      tx_id              TEXT PRIMARY KEY,
      block_number       INTEGER NOT NULL,
      block_hash         TEXT    NOT NULL,
      prev_block_hash    TEXT    NOT NULL,
      cert_hash          TEXT    NOT NULL,
      cert_id            TEXT    NOT NULL,
      certificate_number TEXT    NOT NULL,
      issuer_code        TEXT    NOT NULL,
      university_name    TEXT    NOT NULL,
      anchored_at        TEXT    DEFAULT CURRENT_TIMESTAMP,
      network            TEXT    DEFAULT 'SIMULATED',
      status             TEXT    DEFAULT 'CONFIRMED'
    );
    CREATE INDEX IF NOT EXISTS idx_bc_cert_hash   ON blockchain_anchors(cert_hash);
    CREATE INDEX IF NOT EXISTS idx_bc_cert_id     ON blockchain_anchors(cert_id);
    CREATE INDEX IF NOT EXISTS idx_bc_block       ON blockchain_anchors(block_number);
    CREATE INDEX IF NOT EXISTS idx_bc_issuer      ON blockchain_anchors(issuer_code);
  `);

  // AI Fraud Analysis table - append-only, never modifies existing tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS fraud_analysis (
      id             TEXT PRIMARY KEY,
      certificate_id TEXT NOT NULL,
      risk_score     INTEGER NOT NULL,
      risk_level     TEXT NOT NULL,
      analysis_json  TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      created_at     TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_fraud_cert_id ON fraud_analysis(certificate_id);
  `);

  // AI Chat Assistant history table - append-only, never modifies existing tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id          TEXT PRIMARY KEY,
      user_id     TEXT,
      role        TEXT NOT NULL,
      message     TEXT NOT NULL,
      response    TEXT NOT NULL,
      session_id  TEXT NOT NULL,
      created_at  TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_history(session_id);
  `);

  // Verified Digital Skill Passport tables — append-only, never modifies existing tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_profile (
      id                 TEXT PRIMARY KEY,
      user_id            TEXT NOT NULL UNIQUE,
      profile_picture    TEXT,
      bio                TEXT,
      headline           TEXT,
      department         TEXT,
      program            TEXT,
      graduation_year    TEXT,
      career_interests   TEXT,
      is_public          INTEGER DEFAULT 1 CHECK(is_public IN (0, 1)),
      created_at         TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at         TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS skills (
      id           TEXT PRIMARY KEY,
      student_id   TEXT NOT NULL,
      skill_name   TEXT NOT NULL,
      category     TEXT NOT NULL,
      proficiency  TEXT NOT NULL CHECK(proficiency IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
      verified     INTEGER DEFAULT 0 CHECK(verified IN (0, 1)),
      created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id                  TEXT PRIMARY KEY,
      student_id          TEXT NOT NULL,
      project_name        TEXT NOT NULL,
      description         TEXT NOT NULL,
      tech_stack          TEXT NOT NULL,
      github_url          TEXT,
      demo_url            TEXT,
      image_url           TEXT,
      start_date          TEXT,
      end_date            TEXT,
      status              TEXT DEFAULT 'Completed',
      associated_cert_id  TEXT,
      created_at          TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS internships (
      id                  TEXT PRIMARY KEY,
      student_id          TEXT NOT NULL,
      company             TEXT NOT NULL,
      role                TEXT NOT NULL,
      duration            TEXT NOT NULL,
      description         TEXT,
      cert_link           TEXT,
      verification_status TEXT DEFAULT 'PENDING',
      created_at          TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS publications (
      id           TEXT PRIMARY KEY,
      student_id   TEXT NOT NULL,
      title        TEXT NOT NULL,
      type         TEXT NOT NULL,
      publisher    TEXT,
      date         TEXT,
      doi          TEXT,
      url          TEXT,
      created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id           TEXT PRIMARY KEY,
      student_id   TEXT NOT NULL,
      title        TEXT NOT NULL,
      category     TEXT NOT NULL,
      organization TEXT,
      date         TEXT,
      description  TEXT,
      created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS licenses (
      id             TEXT PRIMARY KEY,
      student_id     TEXT NOT NULL,
      name           TEXT NOT NULL,
      issuer         TEXT NOT NULL,
      issue_date     TEXT,
      expiry_date    TEXT,
      credential_id  TEXT,
      url            TEXT,
      created_at     TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS portfolio_settings (
      id                      TEXT PRIMARY KEY,
      student_id              TEXT NOT NULL UNIQUE,
      section_visibility_json TEXT NOT NULL,
      updated_at              TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_skills_student       ON skills(student_id);
    CREATE INDEX IF NOT EXISTS idx_projects_student     ON projects(student_id);
    CREATE INDEX IF NOT EXISTS idx_internships_student  ON internships(student_id);
    CREATE INDEX IF NOT EXISTS idx_publications_student ON publications(student_id);
    CREATE INDEX IF NOT EXISTS idx_achievements_student ON achievements(student_id);
    CREATE INDEX IF NOT EXISTS idx_licenses_student     ON licenses(student_id);
  `);

  // Certificate Category Templates tables — append-only
  db.exec(`
    CREATE TABLE IF NOT EXISTS certificate_templates (
      id               TEXT PRIMARY KEY,
      template_key     TEXT UNIQUE NOT NULL,
      template_name    TEXT NOT NULL,
      category         TEXT NOT NULL,
      primary_color    TEXT NOT NULL,
      secondary_color  TEXT NOT NULL,
      accent_color     TEXT NOT NULL,
      bg_gradient      TEXT,
      border_style     TEXT,
      watermark_text   TEXT,
      is_default       INTEGER DEFAULT 0 CHECK(is_default IN (0, 1)),
      created_at       TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS template_assignments (
      id               TEXT PRIMARY KEY,
      university_id    TEXT NOT NULL,
      category         TEXT NOT NULL,
      template_key     TEXT NOT NULL,
      updated_at       TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(university_id, category)
    );
    CREATE INDEX IF NOT EXISTS idx_tmpl_assign_uni ON template_assignments(university_id);
  `);

  // Auto-seed default university if empty (for clean test suite & initial setup)
  try {
    const uniCount = db.prepare('SELECT COUNT(*) as count FROM universities').get().count;
    if (uniCount === 0) {
      const { v4: uuidv4 } = require('uuid');
      const { generateKeyPair } = require('../utils/crypto');

      const userId = uuidv4();
      const uniId = uuidv4();
      const keys = generateKeyPair();

      db.prepare(`
        INSERT INTO users (id, name, email, password, role)
        VALUES (?, 'Apex Global University Admin', 'admin@apexuniversity.edu', 'hashed_pass_123', 'UNIVERSITY')
      `).run(userId);

      db.prepare(`
        INSERT INTO universities (id, user_id, name, issuer_code, public_key, private_key)
        VALUES (?, ?, 'Apex Global University', 'UNI_APEX', ?, ?)
      `).run(uniId, userId, keys.publicKey, keys.privateKey);

      console.log('Seeded default university: Apex Global University (UNI_APEX)');
    }
  } catch (err) {
    console.warn('Warning during default university seeding:', err.message);
  }

  console.log('DB tables ready');
}

// Automatically initialize DB schema on require so all controllers & test files have ready tables
initDB();

module.exports = { db, initDB };
