const { db } = require('../../core/config/db');
const { v4: uuidv4 } = require('uuid');
const templateService = require('./templateService');

/**
 * Initializes preset templates into database if not present
 */
function seedPresets() {
  const presets = templateService.getAllPresets();
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO certificate_templates (
      id, template_key, template_name, category, primary_color, secondary_color,
      accent_color, bg_gradient, border_style, watermark_text, is_default
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  presets.forEach((p) => {
    insertStmt.run(
      uuidv4(),
      p.template_key,
      p.template_name,
      p.category,
      p.primary_color,
      p.secondary_color,
      p.accent_color,
      p.bg_gradient,
      p.border_style,
      p.watermark_text,
      p.template_key === 'degree_template' ? 1 : 0
    );
  });
}

// Seed upon module require
try {
  seedPresets();
} catch (e) {
  console.error('Error seeding templates:', e.message);
}

function getAllTemplates() {
  return db.prepare('SELECT * FROM certificate_templates ORDER BY category').all();
}

function getTemplateByKey(templateKey) {
  const tmpl = db.prepare('SELECT * FROM certificate_templates WHERE template_key = ?').get(templateKey);
  if (tmpl) return tmpl;
  return templateService.getPresetByKey(templateKey);
}

function getUniversityAssignments(universityId) {
  return db.prepare('SELECT * FROM template_assignments WHERE university_id = ?').all(universityId);
}

function assignTemplateToCategory(universityId, category, templateKey) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO template_assignments (id, university_id, category, template_key, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(university_id, category) DO UPDATE SET
      template_key = excluded.template_key,
      updated_at = CURRENT_TIMESTAMP
  `).run(id, universityId, category, templateKey);

  return db.prepare('SELECT * FROM template_assignments WHERE university_id = ? AND category = ?').get(universityId, category);
}

function getAssignedTemplateForCategory(universityId, category) {
  if (!universityId || !category) return templateService.getPresetByCategory(category);
  const assignment = db.prepare('SELECT template_key FROM template_assignments WHERE university_id = ? AND category = ?').get(universityId, category);
  if (assignment) {
    return getTemplateByKey(assignment.template_key);
  }
  return templateService.getPresetByCategory(category);
}

module.exports = {
  getAllTemplates,
  getTemplateByKey,
  getUniversityAssignments,
  assignTemplateToCategory,
  getAssignedTemplateForCategory,
};
