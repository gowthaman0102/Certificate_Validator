const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

const tables = [
  'verification_events',
  'wallet_events',
  'audit_logs',
  'fraud_analysis',
  'disclosures',
  'revoked_certificates',
  'certificates',
  'template_assignments',
  'certificate_templates',
  'achievements',
  'internships',
  'licenses',
  'projects',
  'publications',
  'skills',
  'student_learning_goals',
  'student_portfolio_links',
  'student_profile',
  'portfolio_settings',
  'chat_history',
  'universities',
  'users'
];

try {
  db.exec('PRAGMA foreign_keys = OFF;');
  for (const table of tables) {
    db.exec(`DELETE FROM ${table};`);
  }
  db.exec('PRAGMA foreign_keys = ON;');
  console.log('✅ All database tables wiped clean successfully!');
} catch (err) {
  console.error('❌ Error wiping database:', err.message);
  process.exit(1);
} finally {
  db.close();
}
