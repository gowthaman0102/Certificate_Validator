const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../../core/config/db');
const { logAudit } = require('../../core/utils/auditLogger');
require('dotenv').config();

function normalizeEmail(value) {
  return value ? String(value).trim().toLowerCase() : null;
}

function normalizeRegisterNumber(value) {
  return value ? String(value).trim() : null;
}

function register(req, res) {
  try {
    const { name, email, password, role, register_number } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedRegisterNumber = normalizeRegisterNumber(register_number);

    if (!name || !normalizedEmail || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (!['UNIVERSITY', 'STUDENT'].includes(role)) {
      return res.status(400).json({ error: 'Role must be UNIVERSITY or STUDENT' });
    }

    if (role === 'STUDENT' && !normalizedRegisterNumber) {
      return res.status(400).json({ error: 'Register number is required for student accounts' });
    }

    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    if (normalizedRegisterNumber) {
      const existingRegisterNumber = db.prepare('SELECT id FROM users WHERE register_number = ?').get(normalizedRegisterNumber);
      if (existingRegisterNumber) {
        return res.status(409).json({ error: 'Register number already registered' });
      }
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();

    db.prepare('INSERT INTO users (id, name, email, password, role, register_number) VALUES (?, ?, ?, ?, ?, ?)')
      .run(userId, name, normalizedEmail, hashedPassword, role, normalizedRegisterNumber);

    const token = jwt.sign({ id: userId, email: normalizedEmail, role, register_number: normalizedRegisterNumber }, process.env.JWT_SECRET, { expiresIn: '7d' });

    logAudit(req, {
      module: 'AUTH', action: 'REGISTER', status: 'SUCCESS',
      user_id: userId, user_email: normalizedEmail, user_name: name, role,
      details: { register_number: normalizedRegisterNumber },
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, name, email: normalizedEmail, role, register_number: normalizedRegisterNumber }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

function login(req, res) {
  try {
    const { email, register_number, password, identifier } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Determine what identifier was provided
    // UniversityLogin sends { email, password }
    // StudentLogin sends { email, password } OR { register_number, password }
    // or { identifier } which gets split into email/register_number on the frontend
    const rawEmail = email || (identifier && identifier.includes('@') ? identifier : null);
    const rawRegNum = register_number || (identifier && !identifier.includes('@') ? identifier : null);

    const normalizedEmail = normalizeEmail(rawEmail);
    const normalizedRegisterNumber = normalizeRegisterNumber(rawRegNum);

    if (!normalizedEmail && !normalizedRegisterNumber) {
      return res.status(400).json({ error: 'Email or register number is required' });
    }

    let user = null;
    if (normalizedEmail) {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
    }

    if (!user && normalizedRegisterNumber) {
      user = db.prepare('SELECT * FROM users WHERE register_number = ?').get(normalizedRegisterNumber);
    }

    if (!user) {
      logAudit(req, {
        module: 'AUTH', action: 'LOGIN', status: 'FAILURE',
        user_email: normalizedEmail || normalizedRegisterNumber,
        details: { reason: 'User not found' },
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      logAudit(req, {
        module: 'AUTH', action: 'LOGIN', status: 'FAILURE',
        user_id: user.id, user_email: user.email, user_name: user.name, role: user.role,
        details: { reason: 'Wrong password' },
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, register_number: user.register_number },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logAudit(req, {
      module: 'AUTH', action: 'LOGIN', status: 'SUCCESS',
      user_id: user.id, user_email: user.email, user_name: user.name, role: user.role,
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, register_number: user.register_number }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
function logout(req, res) {
  try {
    if (req.user) {
      logAudit(req, {
        module: 'AUTH', action: 'LOGOUT', status: 'SUCCESS',
        user_id: req.user.id, user_email: req.user.email, role: req.user.role,
      });
    }
    res.json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
}

module.exports = { register, login, logout };
