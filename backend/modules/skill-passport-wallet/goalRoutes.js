const express = require('express');
const router = express.Router();
const goalController = require('./goalController');
const { authenticateToken } = require('../../core/middleware/auth');

router.use(authenticateToken);
router.use((req, res, next) => {
  if (req.user?.role !== 'STUDENT') {
    return res.status(403).json({ error: 'Access denied. Student role required.' });
  }
  next();
});

router.get('/', goalController.getGoals);
router.post('/', goalController.createGoal);
router.put('/:id', goalController.updateGoal);
router.post('/:id/check-in', goalController.habitCheckIn);
router.delete('/:id', goalController.deleteGoal);

module.exports = router;
