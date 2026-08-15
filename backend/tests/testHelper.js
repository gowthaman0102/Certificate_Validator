const { db } = require('../core/config/db');
const { generateKeyPair } = require('../core/utils/crypto');
const { v4: uuidv4 } = require('uuid');

function getOrCreateTestUniversity() {
  let uni = db.prepare('SELECT * FROM universities LIMIT 1').get();
  if (uni) return uni;

  const keys = generateKeyPair();
  const userId = uuidv4();
  const uniId = uuidv4();
  const issuerCode = `UNI_${uuidv4().slice(0, 6).toUpperCase()}`;
  const email = `test_${userId.slice(0, 6)}@test.com`;

  try {
    db.prepare(`
      INSERT INTO users (id, name, email, password, role)
      VALUES (?, 'Test University', ?, 'hashed_pass_123', 'UNIVERSITY')
    `).run(userId, email);

    db.prepare(`
      INSERT INTO universities (id, user_id, name, issuer_code, public_key, private_key)
      VALUES (?, ?, 'Test University', ?, ?, ?)
    `).run(uniId, userId, issuerCode, keys.publicKey, keys.privateKey);
  } catch (err) {
    // If another test thread created one concurrently
    uni = db.prepare('SELECT * FROM universities LIMIT 1').get();
    if (uni) return uni;
  }

  return db.prepare('SELECT * FROM universities WHERE id = ?').get(uniId);
}

module.exports = { getOrCreateTestUniversity };
