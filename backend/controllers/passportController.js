const passportModel = require('../models/passportModel');
const passportService = require('../services/passportService');
const logAudit = require('../utils/auditLogger');
const { db } = require('../config/db');

// GET /api/passport/profile
async function getMyPassport(req, res) {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userRegNumber = req.user.register_number;

    const data = passportService.getFullPassport(userId, userEmail, userRegNumber);
    return res.json({ success: true, data });
  } catch (error) {
    console.error('getMyPassport error:', error);
    return res.status(500).json({ error: 'Failed to retrieve skill passport profile' });
  }
}

// POST /api/passport/profile
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const profile = passportModel.upsertStudentProfile(userId, req.body);

    logAudit(req, {
      module: 'SKILL_PASSPORT',
      action: 'PROFILE_UPDATED',
      status: 'SUCCESS',
      resource_id: userId,
      details: `Student ${req.user.email} updated profile info`,
    });

    return res.json({ success: true, data: profile });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ error: 'Failed to update student profile' });
  }
}

// GET/POST/DELETE Skills
async function getSkills(req, res) {
  try {
    const skills = passportModel.getStudentSkills(req.user.id);
    return res.json({ success: true, data: skills });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch skills' });
  }
}

async function addSkill(req, res) {
  try {
    const { skill_name, category, proficiency } = req.body;
    if (!skill_name || !category || !proficiency) {
      return res.status(400).json({ error: 'skill_name, category, and proficiency are required' });
    }
    const skill = passportModel.addStudentSkill(req.user.id, { skill_name, category, proficiency });

    logAudit(req, {
      module: 'SKILL_PASSPORT',
      action: 'SKILL_ADDED',
      status: 'SUCCESS',
      resource_id: skill.id,
      details: `Added skill ${skill_name} (${category})`,
    });

    return res.json({ success: true, data: skill });
  } catch (error) {
    console.error('addSkill error:', error);
    return res.status(500).json({ error: 'Failed to add skill' });
  }
}

async function deleteSkill(req, res) {
  try {
    passportModel.deleteStudentSkill(req.params.id, req.user.id);
    return res.json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete skill' });
  }
}

// GET/POST/DELETE Projects
async function getProjects(req, res) {
  try {
    const projects = passportModel.getStudentProjects(req.user.id);
    return res.json({ success: true, data: projects });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

async function addProject(req, res) {
  try {
    const { project_name, description, tech_stack } = req.body;
    if (!project_name || !description || !tech_stack) {
      return res.status(400).json({ error: 'project_name, description, and tech_stack are required' });
    }
    const project = passportModel.addStudentProject(req.user.id, req.body);

    logAudit(req, {
      module: 'SKILL_PASSPORT',
      action: 'PROJECT_ADDED',
      status: 'SUCCESS',
      resource_id: project.id,
      details: `Added project ${project_name}`,
    });

    return res.json({ success: true, data: project });
  } catch (error) {
    console.error('addProject error:', error);
    return res.status(500).json({ error: 'Failed to add project' });
  }
}

async function deleteProject(req, res) {
  try {
    passportModel.deleteStudentProject(req.params.id, req.user.id);
    return res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete project' });
  }
}

// GET/POST/DELETE Internships
async function getInternships(req, res) {
  try {
    const internships = passportModel.getStudentInternships(req.user.id);
    return res.json({ success: true, data: internships });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch internships' });
  }
}

async function addInternship(req, res) {
  try {
    const { company, role, duration } = req.body;
    if (!company || !role || !duration) {
      return res.status(400).json({ error: 'company, role, and duration are required' });
    }
    const internship = passportModel.addStudentInternship(req.user.id, req.body);
    return res.json({ success: true, data: internship });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add internship' });
  }
}

async function deleteInternship(req, res) {
  try {
    passportModel.deleteStudentInternship(req.params.id, req.user.id);
    return res.json({ success: true, message: 'Internship deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete internship' });
  }
}

// Publications CRUD
async function addPublication(req, res) {
  try {
    const { title, type } = req.body;
    if (!title || !type) return res.status(400).json({ error: 'title and type are required' });
    const pub = passportModel.addStudentPublication(req.user.id, req.body);
    return res.json({ success: true, data: pub });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add publication' });
  }
}

async function deletePublication(req, res) {
  try {
    passportModel.deleteStudentPublication(req.params.id, req.user.id);
    return res.json({ success: true, message: 'Publication deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete publication' });
  }
}

// Achievements CRUD
async function addAchievement(req, res) {
  try {
    const { title, category } = req.body;
    if (!title || !category) return res.status(400).json({ error: 'title and category are required' });
    const ach = passportModel.addStudentAchievement(req.user.id, req.body);
    return res.json({ success: true, data: ach });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add achievement' });
  }
}

async function deleteAchievement(req, res) {
  try {
    passportModel.deleteStudentAchievement(req.params.id, req.user.id);
    return res.json({ success: true, message: 'Achievement deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete achievement' });
  }
}

// Licenses CRUD
async function addLicense(req, res) {
  try {
    const { name, issuer } = req.body;
    if (!name || !issuer) return res.status(400).json({ error: 'name and issuer are required' });
    const lic = passportModel.addStudentLicense(req.user.id, req.body);
    return res.json({ success: true, data: lic });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add license' });
  }
}

async function deleteLicense(req, res) {
  try {
    passportModel.deleteStudentLicense(req.params.id, req.user.id);
    return res.json({ success: true, message: 'License deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete license' });
  }
}

// Settings
async function updateSettings(req, res) {
  try {
    const updated = passportModel.upsertPortfolioSettings(req.user.id, req.body);
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update portfolio settings' });
  }
}

// Public Profile GET /api/passport/public/:id
async function getPublicProfile(req, res) {
  try {
    const { id } = req.params;
    // Search user by ID or register_number
    const targetUser = db.prepare('SELECT id, name, email, register_number FROM users WHERE id = ? OR register_number = ?').get(id, id);
    if (!targetUser) {
      return res.status(404).json({ error: 'Public student profile not found' });
    }

    const fullPassport = passportService.getFullPassport(targetUser.id, targetUser.email, targetUser.register_number);

    // Check if profile is marked as public
    if (fullPassport.profile?.is_public === 0) {
      return res.status(403).json({ error: 'This student portfolio is set to private by the student' });
    }

    // Filter section visibilities according to student settings
    const settings = fullPassport.settings || {};
    const filteredPassport = {
      student_name: targetUser.name,
      user_id: targetUser.id,
      register_number: targetUser.register_number,
      profile: fullPassport.profile,
      profileScore: fullPassport.profileScore,
      completionPercentage: fullPassport.completionPercentage,
      certificates: settings.certificates !== 'Private' && settings.certificates !== 'Hidden' ? fullPassport.certificates : [],
      skills: settings.skills !== 'Private' && settings.skills !== 'Hidden' ? fullPassport.skills : [],
      projects: settings.projects !== 'Private' && settings.projects !== 'Hidden' ? fullPassport.projects : [],
      internships: settings.internships !== 'Private' && settings.internships !== 'Hidden' ? fullPassport.internships : [],
      publications: settings.publications !== 'Private' && settings.publications !== 'Hidden' ? fullPassport.publications : [],
      achievements: settings.achievements !== 'Private' && settings.achievements !== 'Hidden' ? fullPassport.achievements : [],
      licenses: settings.licenses !== 'Private' && settings.licenses !== 'Hidden' ? fullPassport.licenses : [],
      timeline: settings.timeline !== 'Private' && settings.timeline !== 'Hidden' ? fullPassport.timeline : [],
    };

    logAudit(req, {
      module: 'SKILL_PASSPORT',
      action: 'PROFILE_SHARED',
      status: 'SUCCESS',
      resource_id: targetUser.id,
      details: `Public view of student portfolio ${targetUser.name}`,
    });

    return res.json({ success: true, data: filteredPassport });
  } catch (error) {
    console.error('getPublicProfile error:', error);
    return res.status(500).json({ error: 'Failed to load public profile' });
  }
}

// Log audit on export
async function logExportAudit(req, res) {
  try {
    const { type } = req.body;
    logAudit(req, {
      module: 'SKILL_PASSPORT',
      action: 'PORTFOLIO_EXPORTED',
      status: 'SUCCESS',
      resource_id: req.user.id,
      details: `Exported portfolio as ${type || 'PDF'}`,
    });
    return res.json({ success: true, message: 'Export audit logged' });
  } catch {
    return res.status(500).json({ error: 'Failed to log export audit' });
  }
}

module.exports = {
  getMyPassport,
  updateProfile,
  getSkills,
  addSkill,
  deleteSkill,
  getProjects,
  addProject,
  deleteProject,
  getInternships,
  addInternship,
  deleteInternship,
  addPublication,
  deletePublication,
  addAchievement,
  deleteAchievement,
  addLicense,
  deleteLicense,
  updateSettings,
  getPublicProfile,
  logExportAudit,
};
