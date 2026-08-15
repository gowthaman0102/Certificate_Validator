const express = require('express');
const router = express.Router();
const passportController = require('./passportController');
const { authenticateToken } = require('../../core/middleware/auth');

// Public route — no auth required
router.get('/public/:id', passportController.getPublicProfile);

// Protected routes — student role required
router.use(authenticateToken);
router.use((req, res, next) => {
  if (req.user?.role !== 'STUDENT') {
    return res.status(403).json({ error: 'Access denied. Student role required.' });
  }
  next();
});

router.get('/profile', passportController.getMyPassport);
router.post('/profile', passportController.updateProfile);

router.get('/skills', passportController.getSkills);
router.post('/skills', passportController.addSkill);
router.delete('/skills/:id', passportController.deleteSkill);

router.get('/projects', passportController.getProjects);
router.post('/projects', passportController.addProject);
router.delete('/projects/:id', passportController.deleteProject);

router.get('/internships', passportController.getInternships);
router.post('/internships', passportController.addInternship);
router.delete('/internships/:id', passportController.deleteInternship);

router.post('/publications', passportController.addPublication);
router.delete('/publications/:id', passportController.deletePublication);

router.post('/achievements', passportController.addAchievement);
router.delete('/achievements/:id', passportController.deleteAchievement);

router.post('/licenses', passportController.addLicense);
router.delete('/licenses/:id', passportController.deleteLicense);

router.post('/settings', passportController.updateSettings);
router.post('/log-export', passportController.logExportAudit);

router.get('/ai-insights', passportController.getAICareerInsights);
router.get('/portfolio-links', passportController.getPortfolioLinks);
router.post('/portfolio-links', passportController.addPortfolioLink);
router.delete('/portfolio-links/:id', passportController.deletePortfolioLink);

module.exports = router;
