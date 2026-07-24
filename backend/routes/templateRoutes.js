const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { authenticateToken } = require('../middleware/auth');

// Public or active template lookup
router.get('/active', templateController.getActiveTemplate);
router.get('/list', templateController.listTemplates);

// Protected University routes
router.use(authenticateToken);
router.use((req, res, next) => {
  if (req.user?.role !== 'UNIVERSITY') {
    return res.status(403).json({ error: 'Access denied. University role required.' });
  }
  next();
});

router.get('/assignments', templateController.getAssignments);
router.post('/assign', templateController.assignTemplate);

module.exports = router;
