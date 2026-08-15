const templateModel = require('./templateModel');
const templateService = require('./templateService');
const logAudit = require('../../core/utils/auditLogger');
const { db } = require('../../core/config/db');

// GET /api/templates — List all available templates
async function listTemplates(req, res) {
  try {
    const templates = templateModel.getAllTemplates();
    return res.json({ success: true, data: templates });
  } catch (error) {
    console.error('listTemplates error:', error);
    return res.status(500).json({ error: 'Failed to list certificate templates' });
  }
}

// GET /api/templates/assignments — Get university template assignments
async function getAssignments(req, res) {
  try {
    const university = db.prepare('SELECT id FROM universities WHERE user_id = ?').get(req.user.id);
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }
    const assignments = templateModel.getUniversityAssignments(university.id);
    return res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('getAssignments error:', error);
    return res.status(500).json({ error: 'Failed to fetch template assignments' });
  }
}

// POST /api/templates/assign — Assign template to category
async function assignTemplate(req, res) {
  try {
    const { category, template_key } = req.body;
    if (!category || !template_key) {
      return res.status(400).json({ error: 'category and template_key are required' });
    }

    const university = db.prepare('SELECT id, name FROM universities WHERE user_id = ?').get(req.user.id);
    if (!university) {
      return res.status(404).json({ error: 'University profile not found' });
    }

    const result = templateModel.assignTemplateToCategory(university.id, category, template_key);

    logAudit(req, {
      module: 'CERTIFICATE_TEMPLATES',
      action: 'TEMPLATE_ASSIGNED',
      status: 'SUCCESS',
      resource_id: result.id,
      details: `Assigned template ${template_key} to category '${category}' for ${university.name}`,
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('assignTemplate error:', error);
    return res.status(500).json({ error: 'Failed to assign template' });
  }
}

// GET /api/templates/active?category=Degree Certificate — Get active template for category
async function getActiveTemplate(req, res) {
  try {
    const { category, university_id } = req.query;
    let uniId = university_id;

    if (!uniId && req.user?.role === 'UNIVERSITY') {
      const university = db.prepare('SELECT id FROM universities WHERE user_id = ?').get(req.user.id);
      if (university) uniId = university.id;
    }

    const template = templateModel.getAssignedTemplateForCategory(uniId, category);
    return res.json({ success: true, data: template });
  } catch (error) {
    console.error('getActiveTemplate error:', error);
    return res.status(500).json({ error: 'Failed to fetch active template' });
  }
}

module.exports = {
  listTemplates,
  getAssignments,
  assignTemplate,
  getActiveTemplate,
};
