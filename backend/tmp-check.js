const { db } = require('./config/db');
const user = db.prepare('SELECT id, email, role, register_number FROM users WHERE email = ?').get('student@example.com');
console.log(JSON.stringify(user));
