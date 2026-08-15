const { v4: uuidv4 } = require('uuid');
const { db } = require('../../core/config/db');
const { generateKeyPair } = require('../../core/utils/crypto');

// Create a university profile for the logged-in user (role must be UNIVERSITY)
function createUniversity(req, res) {
  try {
    const { name, issuer_code } = req.body;
    const userId = req.user.id;

    if (!name || !issuer_code) {
      return res.status(400).json({ error: 'name and issuer_code are required' });
    }

    if (req.user.role !== 'UNIVERSITY') {
      return res.status(403).json({ error: 'Only UNIVERSITY accounts can create a university profile' });
    }

    const existing = db.prepare('SELECT id FROM universities WHERE user_id = ?').get(userId);
    if (existing) {
      return res.status(409).json({ error: 'University profile already exists for this account' });
    }

    const codeTaken = db.prepare('SELECT id FROM universities WHERE issuer_code = ?').get(issuer_code);
    if (codeTaken) {
      return res.status(409).json({ error: 'issuer_code already in use' });
    }

    const { publicKey, privateKey } = generateKeyPair();
    const universityId = uuidv4();

    db.prepare(`
      INSERT INTO universities (id, user_id, name, issuer_code, public_key, private_key)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(universityId, userId, name, issuer_code, publicKey, privateKey);

    res.status(201).json({
      message: 'University profile created successfully',
      university: { id: universityId, name, issuer_code, public_key: publicKey }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create university profile' });
  }
}

// Get university details by ID (public info only — never expose private_key)
function getUniversity(req, res) {
  try {
    const { id } = req.params;
    const university = db.prepare('SELECT id, name, issuer_code, public_key, created_at FROM universities WHERE id = ?').get(id);

    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    res.json(university);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch university' });
  }
}

// Get the logged-in user's own university profile
function getMyUniversity(req, res) {
  try {
    const userId = req.user.id;
    const university = db.prepare('SELECT id, name, issuer_code, public_key, created_at FROM universities WHERE user_id = ?').get(userId);

    if (!university) {
      return res.status(404).json({ error: 'No university profile found for this account' });
    }

    res.json(university);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch university profile' });
  }
}

module.exports = { createUniversity, getUniversity, getMyUniversity };
