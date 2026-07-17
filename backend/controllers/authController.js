const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/db');
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
    const normalizedEmail = normalizeEmail(email || identifier);
    const normalizedRegisterNumber = normalizeRegisterNumber(register_number || identifier);

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

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
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, register_number: user.register_number }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, register_number: user.register_number }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { register, login };
