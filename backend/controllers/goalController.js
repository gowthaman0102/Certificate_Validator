const { db } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// GET /api/goals
function getGoals(req, res) {
  try {
    const userId = req.user.id;
    const goals = db.prepare('SELECT * FROM student_learning_goals WHERE student_user_id = ? ORDER BY created_at DESC').all(userId);

    const totalActive = goals.filter(g => g.status === 'IN_PROGRESS').length;
    const totalCompleted = goals.filter(g => g.status === 'COMPLETED').length;
    const highestStreak = goals.reduce((max, g) => Math.max(max, g.current_streak || 0), 0);
    const overallConsistency = goals.length > 0 ? Math.round((totalCompleted + goals.reduce((s, g) => s + (g.current_streak > 0 ? 1 : 0), 0)) / (goals.length * 2) * 100) : 0;

    return res.json({
      success: true,
      data: goals,
      stats: {
        totalActive,
        totalCompleted,
        highestStreak,
        overallConsistency,
      }
    });
  } catch (err) {
    console.error('getGoals error:', err);
    return res.status(500).json({ error: 'Failed to fetch learning goals' });
  }
}

// POST /api/goals
function createGoal(req, res) {
  try {
    const userId = req.user.id;
    const { goal_title, category, target_date, priority, notes } = req.body;

    if (!goal_title || !goal_title.trim()) {
      return res.status(400).json({ error: 'Goal title is required' });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO student_learning_goals (id, student_user_id, goal_title, category, target_date, priority, notes, progress_percentage, status, current_streak)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'IN_PROGRESS', 0)
    `).run(
      id,
      userId,
      goal_title.trim(),
      category || 'General',
      target_date || null,
      priority || 'Medium',
      notes || ''
    );

    const created = db.prepare('SELECT * FROM student_learning_goals WHERE id = ?').get(id);
    return res.json({ success: true, data: created });
  } catch (err) {
    console.error('createGoal error:', err);
    return res.status(500).json({ error: 'Failed to create goal' });
  }
}

// PUT /api/goals/:id
function updateGoal(req, res) {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const { progress_percentage, status, notes } = req.body;

    const existing = db.prepare('SELECT * FROM student_learning_goals WHERE id = ? AND student_user_id = ?').get(goalId, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    let newStatus = status || existing.status;
    let newProgress = progress_percentage !== undefined ? Math.min(100, Math.max(0, parseInt(progress_percentage))) : existing.progress_percentage;

    if (newProgress === 100) newStatus = 'COMPLETED';

    db.prepare(`
      UPDATE student_learning_goals
      SET progress_percentage = ?, status = ?, notes = COALESCE(?, notes)
      WHERE id = ? AND student_user_id = ?
    `).run(newProgress, newStatus, notes, goalId, userId);

    const updated = db.prepare('SELECT * FROM student_learning_goals WHERE id = ?').get(goalId);
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('updateGoal error:', err);
    return res.status(500).json({ error: 'Failed to update goal' });
  }
}

// POST /api/goals/:id/check-in (Daily Habit Tracker)
// POST /api/goals/:id/check-in (Daily Habit Tracker — Once Per Day Only)
function habitCheckIn(req, res) {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;

    const existing = db.prepare('SELECT * FROM student_learning_goals WHERE id = ? AND student_user_id = ?').get(goalId, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Strictly enforce ONCE PER DAY check-in
    if (existing.last_checked_in === todayStr) {
      return res.status(400).json({ error: 'Already checked in for today! Check in again tomorrow.' });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = existing.current_streak || 0;
    if (existing.last_checked_in === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    let newProgress = Math.min(100, existing.progress_percentage + 10);
    let newStatus = newProgress >= 100 ? 'COMPLETED' : existing.status;

    db.prepare(`
      UPDATE student_learning_goals
      SET current_streak = ?, last_checked_in = ?, progress_percentage = ?, status = ?
      WHERE id = ? AND student_user_id = ?
    `).run(newStreak, todayStr, newProgress, newStatus, goalId, userId);

    const updated = db.prepare('SELECT * FROM student_learning_goals WHERE id = ?').get(goalId);
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('habitCheckIn error:', err);
    return res.status(500).json({ error: 'Failed to check in habit' });
  }
}

// DELETE /api/goals/:id
function deleteGoal(req, res) {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;

    db.prepare('DELETE FROM student_learning_goals WHERE id = ? AND student_user_id = ?').run(goalId, userId);
    return res.json({ success: true, message: 'Goal deleted' });
  } catch (err) {
    console.error('deleteGoal error:', err);
    return res.status(500).json({ error: 'Failed to delete goal' });
  }
}

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  habitCheckIn,
  deleteGoal,
};
