const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

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
  'blockchain_anchors',
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
  
  // Wipe all application tables
  for (const table of tables) {
    db.exec(`DELETE FROM ${table};`);
  }

  // Reset auto-increment sequences if sqlite_sequence exists
  const hasSeq = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'").get();
  if (hasSeq) {
    db.exec('DELETE FROM sqlite_sequence;');
  }

  db.exec('PRAGMA foreign_keys = ON;');
  console.log('✅ All database tables (users, certificates, blockchain anchors, verifications, wallet, audit logs, etc.) wiped clean!');

  // Clean uploaded/generated files in backend/uploads/
  const uploadsDir = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    let removedCount = 0;
    for (const file of files) {
      if (file !== '.gitkeep') {
        fs.unlinkSync(path.join(uploadsDir, file));
        removedCount++;
      }
    }
    console.log(`📁 Cleaned ${removedCount} generated upload files from backend/uploads/`);
  }

  console.log('\n✨ COMPLETE RESET SUCCESSFUL: Application is completely blank and ready for real-time hackathon demo!');
} catch (err) {
  console.error('❌ Error wiping database:', err.message);
  process.exit(1);
} finally {
  db.close();
}
