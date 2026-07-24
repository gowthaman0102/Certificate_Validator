const { db } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Profile CRUD
function getStudentProfile(userId) {
  const profile = db.prepare('SELECT * FROM student_profile WHERE user_id = ?').get(userId);
  if (!profile) return null;
  return profile;
}

function upsertStudentProfile(userId, data) {
  const existing = getStudentProfile(userId);
  if (existing) {
    db.prepare(`
      UPDATE student_profile
      SET profile_picture = ?, bio = ?, headline = ?, department = ?, program = ?,
          graduation_year = ?, career_interests = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(
      data.profile_picture ?? existing.profile_picture,
      data.bio ?? existing.bio,
      data.headline ?? existing.headline,
      data.department ?? existing.department,
      data.program ?? existing.program,
      data.graduation_year ?? existing.graduation_year,
      data.career_interests ?? existing.career_interests,
      data.is_public !== undefined ? (data.is_public ? 1 : 0) : existing.is_public,
      userId
    );
  } else {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO student_profile (
        id, user_id, profile_picture, bio, headline, department, program,
        graduation_year, career_interests, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, userId,
      data.profile_picture || null,
      data.bio || '',
      data.headline || '',
      data.department || '',
      data.program || '',
      data.graduation_year || '',
      data.career_interests || '',
      data.is_public !== undefined ? (data.is_public ? 1 : 0) : 1
    );
  }
  return getStudentProfile(userId);
}

// Skills CRUD
function getStudentSkills(studentId) {
  return db.prepare('SELECT * FROM skills WHERE student_id = ? ORDER BY category, skill_name').all(studentId);
}

function addStudentSkill(studentId, { skill_name, category, proficiency, verified = 0 }) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO skills (id, student_id, skill_name, category, proficiency, verified)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, studentId, skill_name, category, proficiency, verified ? 1 : 0);
  return db.prepare('SELECT * FROM skills WHERE id = ?').get(id);
}

function updateStudentSkill(id, studentId, { skill_name, category, proficiency, verified }) {
  db.prepare(`
    UPDATE skills
    SET skill_name = COALESCE(?, skill_name),
        category = COALESCE(?, category),
        proficiency = COALESCE(?, proficiency),
        verified = COALESCE(?, verified)
    WHERE id = ? AND student_id = ?
  `).run(skill_name, category, proficiency, verified !== undefined ? (verified ? 1 : 0) : null, id, studentId);
  return db.prepare('SELECT * FROM skills WHERE id = ?').get(id);
}

function deleteStudentSkill(id, studentId) {
  return db.prepare('DELETE FROM skills WHERE id = ? AND student_id = ?').run(id, studentId);
}

// Projects CRUD
function getStudentProjects(studentId) {
  return db.prepare('SELECT * FROM projects WHERE student_id = ? ORDER BY created_at DESC').all(studentId);
}

function addStudentProject(studentId, data) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO projects (
      id, student_id, project_name, description, tech_stack, github_url, demo_url,
      image_url, start_date, end_date, status, associated_cert_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, studentId,
    data.project_name, data.description, data.tech_stack,
    data.github_url || null, data.demo_url || null, data.image_url || null,
    data.start_date || null, data.end_date || null, data.status || 'Completed',
    data.associated_cert_id || null
  );
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

function updateStudentProject(id, studentId, data) {
  db.prepare(`
    UPDATE projects
    SET project_name = COALESCE(?, project_name),
        description = COALESCE(?, description),
        tech_stack = COALESCE(?, tech_stack),
        github_url = ?, demo_url = ?, image_url = ?,
        start_date = ?, end_date = ?, status = COALESCE(?, status),
        associated_cert_id = ?
    WHERE id = ? AND student_id = ?
  `).run(
    data.project_name, data.description, data.tech_stack,
    data.github_url, data.demo_url, data.image_url,
    data.start_date, data.end_date, data.status, data.associated_cert_id,
    id, studentId
  );
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

function deleteStudentProject(id, studentId) {
  return db.prepare('DELETE FROM projects WHERE id = ? AND student_id = ?').run(id, studentId);
}

// Internships CRUD
function getStudentInternships(studentId) {
  return db.prepare('SELECT * FROM internships WHERE student_id = ? ORDER BY created_at DESC').all(studentId);
}

function addStudentInternship(studentId, data) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO internships (
      id, student_id, company, role, duration, description, cert_link, verification_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, studentId, data.company, data.role, data.duration,
    data.description || '', data.cert_link || null, data.verification_status || 'PENDING'
  );
  return db.prepare('SELECT * FROM internships WHERE id = ?').get(id);
}

function updateStudentInternship(id, studentId, data) {
  db.prepare(`
    UPDATE internships
    SET company = COALESCE(?, company), role = COALESCE(?, role),
        duration = COALESCE(?, duration), description = COALESCE(?, description),
        cert_link = ?, verification_status = COALESCE(?, verification_status)
    WHERE id = ? AND student_id = ?
  `).run(data.company, data.role, data.duration, data.description, data.cert_link, data.verification_status, id, studentId);
  return db.prepare('SELECT * FROM internships WHERE id = ?').get(id);
}

function deleteStudentInternship(id, studentId) {
  return db.prepare('DELETE FROM internships WHERE id = ? AND student_id = ?').run(id, studentId);
}

// Publications CRUD
function getStudentPublications(studentId) {
  return db.prepare('SELECT * FROM publications WHERE student_id = ? ORDER BY created_at DESC').all(studentId);
}

function addStudentPublication(studentId, data) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO publications (id, student_id, title, type, publisher, date, doi, url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, studentId, data.title, data.type, data.publisher || '', data.date || '', data.doi || '', data.url || '');
  return db.prepare('SELECT * FROM publications WHERE id = ?').get(id);
}

function deleteStudentPublication(id, studentId) {
  return db.prepare('DELETE FROM publications WHERE id = ? AND student_id = ?').run(id, studentId);
}

// Achievements CRUD
function getStudentAchievements(studentId) {
  return db.prepare('SELECT * FROM achievements WHERE student_id = ? ORDER BY created_at DESC').all(studentId);
}

function addStudentAchievement(studentId, data) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO achievements (id, student_id, title, category, organization, date, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, studentId, data.title, data.category, data.organization || '', data.date || '', data.description || '');
  return db.prepare('SELECT * FROM achievements WHERE id = ?').get(id);
}

function deleteStudentAchievement(id, studentId) {
  return db.prepare('DELETE FROM achievements WHERE id = ? AND student_id = ?').run(id, studentId);
}

// Licenses CRUD
function getStudentLicenses(studentId) {
  return db.prepare('SELECT * FROM licenses WHERE student_id = ? ORDER BY created_at DESC').all(studentId);
}

function addStudentLicense(studentId, data) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO licenses (id, student_id, name, issuer, issue_date, expiry_date, credential_id, url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, studentId, data.name, data.issuer, data.issue_date || '', data.expiry_date || '', data.credential_id || '', data.url || '');
  return db.prepare('SELECT * FROM licenses WHERE id = ?').get(id);
}

function deleteStudentLicense(id, studentId) {
  return db.prepare('DELETE FROM licenses WHERE id = ? AND student_id = ?').run(id, studentId);
}

// Portfolio Settings (Visibility)
function getPortfolioSettings(studentId) {
  const row = db.prepare('SELECT * FROM portfolio_settings WHERE student_id = ?').get(studentId);
  if (!row) {
    const defaultSettings = {
      certificates: 'Public',
      skills: 'Public',
      projects: 'Public',
      internships: 'Public',
      publications: 'Public',
      achievements: 'Public',
      licenses: 'Public',
      timeline: 'Public',
    };
    return defaultSettings;
  }
  try {
    return JSON.parse(row.section_visibility_json);
  } catch {
    return {};
  }
}

function upsertPortfolioSettings(studentId, settingsObj) {
  const existing = db.prepare('SELECT * FROM portfolio_settings WHERE student_id = ?').get(studentId);
  const jsonStr = JSON.stringify(settingsObj);
  if (existing) {
    db.prepare('UPDATE portfolio_settings SET section_visibility_json = ?, updated_at = CURRENT_TIMESTAMP WHERE student_id = ?').run(jsonStr, studentId);
  } else {
    db.prepare('INSERT INTO portfolio_settings (id, student_id, section_visibility_json) VALUES (?, ?, ?)').run(uuidv4(), studentId, jsonStr);
  }
  return getPortfolioSettings(studentId);
}

module.exports = {
  getStudentProfile,
  upsertStudentProfile,
  getStudentSkills,
  addStudentSkill,
  updateStudentSkill,
  deleteStudentSkill,
  getStudentProjects,
  addStudentProject,
  updateStudentProject,
  deleteStudentProject,
  getStudentInternships,
  addStudentInternship,
  updateStudentInternship,
  deleteStudentInternship,
  getStudentPublications,
  addStudentPublication,
  deleteStudentPublication,
  getStudentAchievements,
  addStudentAchievement,
  deleteStudentAchievement,
  getStudentLicenses,
  addStudentLicense,
  deleteStudentLicense,
  getPortfolioSettings,
  upsertPortfolioSettings,
};
