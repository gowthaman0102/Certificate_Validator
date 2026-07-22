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
      reason TEXT,
      revoked_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (certificate_id) REFERENCES certificates(id)
    );

    CREATE INDEX IF NOT EXISTS idx_certificates_register_number ON certificates(register_number);
  `);

  // Migration: add register_number to users table if it doesn't exist yet
  const userColumns = db.pragma('table_info(users)').map((c) => c.name);
  if (!userColumns.includes('register_number')) {
    db.exec('ALTER TABLE users ADD COLUMN register_number TEXT;');
    console.log('Migration: added register_number column to users table');
  }

  // Wallet events table (new — safe to add without touching existing tables)
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

  console.log('DB tables ready');
}

module.exports = { db, initDB };
