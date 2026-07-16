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
      cgpa TEXT NOT NULL,
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
  console.log('DB tables ready');
}

module.exports = { db, initDB };
