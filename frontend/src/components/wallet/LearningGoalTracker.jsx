import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../api/client";

const GS = { ink: "#0a0a0a", muted: "#64748b", subtle: "#94a3b8", border: "#e2e8f0", bg: "#ffffff" };
const PREMIUM = [0.16, 1, 0.3, 1];

const GOAL_CATEGORIES = [
  "Programming & Languages",
  "Web & Full Stack",
  "Mobile App Development",
  "AI, ML & Data Science",
  "Cloud & DevOps Infrastructure",
  "Cybersecurity & Networking",
  "Database & System Design",
  "Certifications & Exams",
  "Academic & Coursework",
  "Research & Publications",
  "Portfolio Projects",
  "Competitive Coding & Algorithms",
  "UI/UX & Creative Design",
  "Open Source Contributions",
  "Hackathons & Competitions",
  "Soft Skills & Leadership",
  "Languages & Communication",
  "Career Preparation & Placement",
  "Personal Development",
  "General / Other"
];
const PRIORITIES = ["High", "Medium", "Low"];

export default function LearningGoalTracker() {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({ totalActive: 0, totalCompleted: 0, highestStreak: 0, overallConsistency: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState("ALL"); // ALL | IN_PROGRESS | COMPLETED

  const [form, setForm] = useState({
    goal_title: "",
    category: "Programming & Languages",
    target_date: "",
    priority: "Medium",
    notes: ""
  });

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    setLoading(true);
    try {
      const res = await API.get("/goals");
      setGoals(res.data?.data || []);
      setStats(res.data?.stats || { totalActive: 0, totalCompleted: 0, highestStreak: 0, overallConsistency: 0 });
    } catch {
      // Fallback local memory state
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGoal(e) {
    e.preventDefault();
    if (!form.goal_title.trim()) return;
    try {
      await API.post("/goals", form);
      setForm({ goal_title: "", category: "Programming", target_date: "", priority: "Medium", notes: "" });
      setShowAddForm(false);
      loadGoals();
    } catch {
      alert("Failed to create learning goal");
    }
  }

  async function handleHabitCheckIn(id) {
    try {
      await API.post(`/goals/${id}/check-in`);
      loadGoals();
    } catch {
      alert("Failed to check in habit");
    }
  }

  async function handleUpdateProgress(id, newProgress) {
    try {
      await API.put(`/goals/${id}`, { progress_percentage: newProgress });
      loadGoals();
    } catch {
      alert("Failed to update progress");
    }
  }

  async function handleDeleteGoal(id) {
    try {
      await API.delete(`/goals/${id}`);
      loadGoals();
    } catch {
      alert("Failed to delete goal");
    }
  }

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredGoals = goals.filter(g => {
    if (filter === "IN_PROGRESS") return g.status === "IN_PROGRESS";
    if (filter === "COMPLETED") return g.status === "COMPLETED";
    return true;
  });

  return (
    <div>
      {/* ── STAT TILES SUMMARY ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "0.85rem", textAlign: "center" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: GS.muted, textTransform: "uppercase" }}>Active Goals</span>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0a0a0a", marginTop: "2px" }}>{stats.totalActive}</div>
        </div>

        <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "0.85rem", textAlign: "center" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: GS.muted, textTransform: "uppercase" }}>Completed</span>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#059669", marginTop: "2px" }}>{stats.totalCompleted}</div>
        </div>

        <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "0.85rem", textAlign: "center" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: GS.muted, textTransform: "uppercase" }}>Longest Streak</span>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ea580c", marginTop: "2px" }}>{stats.highestStreak} Days</div>
        </div>

        <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "0.85rem", textAlign: "center" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: GS.muted, textTransform: "uppercase" }}>Consistency</span>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#2563eb", marginTop: "2px" }}>{stats.overallConsistency}%</div>
        </div>
      </div>

      {/* ── CONTROLS & ADD GOAL TRIGGER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.35rem" }}>
          {[
            { id: "ALL", label: `All (${goals.length})` },
            { id: "IN_PROGRESS", label: `Active (${stats.totalActive})` },
            { id: "COMPLETED", label: `Completed (${stats.totalCompleted})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                background: filter === tab.id ? "#0a0a0a" : "#f1f5f9",
                color: filter === tab.id ? "#ffffff" : "#475569",
                border: "none",
                borderRadius: "14px",
                padding: "0.25rem 0.65rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          className="btn"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ fontSize: "0.78rem", padding: "0.35rem 0.85rem" }}
        >
          {showAddForm ? "Cancel Form" : "+ Create New Learning Goal"}
        </button>
      </div>

      {/* ── ADD NEW GOAL FORM DRAWER ── */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: PREMIUM }}
            onSubmit={handleCreateGoal}
            style={{
              background: "#f8fafc",
              border: "1.5px solid #0a0a0a",
              borderRadius: "14px",
              padding: "1.25rem",
              marginBottom: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              overflow: "hidden"
            }}
          >
            <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0a0a0a" }}>Set a New Learning Goal</h4>

            <input
              type="text"
              value={form.goal_title}
              onChange={(e) => setForm({ ...form, goal_title: e.target.value })}
              placeholder="Goal Title (e.g. Master System Design & Distributed Systems)"
              required
              style={{ fontSize: "0.85rem", padding: "0.45rem 0.75rem", borderRadius: "8px", border: "1px solid #0a0a0a" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "3px" }}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ fontSize: "0.82rem", padding: "0.4rem 0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%" }}
                >
                  {GOAL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "3px" }}>Priority Level</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  style={{ fontSize: "0.82rem", padding: "0.4rem 0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%" }}
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p} Priority</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "3px" }}>Target Completion Date</label>
                <input
                  type="date"
                  value={form.target_date}
                  onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                  onClick={(e) => { try { e.target.showPicker && e.target.showPicker(); } catch {} }}
                  onFocus={(e) => { try { e.target.showPicker && e.target.showPicker(); } catch {} }}
                  style={{ fontSize: "0.82rem", padding: "0.4rem 0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", cursor: "pointer", width: "100%" }}
                />
              </div>
            </div>

            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Target Milestones or Daily Habits (e.g. Complete 2 LeetCode Medium problems daily)"
              rows={2}
              style={{ fontSize: "0.82rem", padding: "0.45rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
            />

            <button className="btn" type="submit" style={{ alignSelf: "flex-start", fontSize: "0.82rem" }}>
              Save Learning Goal
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ── GOALS LIST & HABIT MONITORING CARDS ── */}
      {filteredGoals.length === 0 ? (
        <div style={{ background: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: "12px", padding: "2rem 1.5rem", textAlign: "center", color: GS.muted }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#0a0a0a", fontSize: "0.95rem" }}>No learning goals set yet</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem" }}>Create your first goal above to start tracking daily habits and monitoring consistency.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {filteredGoals.map((goal) => {
            const isDoneToday = goal.last_checked_in === todayStr;
            const isCompleted = goal.status === "COMPLETED" || goal.progress_percentage >= 100;
            const priorityColor = goal.priority === "High" ? "#ef4444" : goal.priority === "Medium" ? "#f97316" : "#64748b";

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: "#ffffff",
                  border: isCompleted ? "1.5px solid #10b981" : "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "1rem 1.2rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.6rem", marginBottom: "0.5rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#0a0a0a" }}>
                        {goal.goal_title}
                      </h4>

                      <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "0.1rem 0.45rem", borderRadius: "10px", background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" }}>
                        {goal.category}
                      </span>

                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: priorityColor, background: `${priorityColor}15`, padding: "0.1rem 0.45rem", borderRadius: "10px" }}>
                        {goal.priority} Priority
                      </span>

                      {isCompleted && (
                        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#059669", background: "#d1fae5", padding: "0.1rem 0.45rem", borderRadius: "10px" }}>
                          ✓ Completed
                        </span>
                      )}
                    </div>

                    {goal.notes && (
                      <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: GS.muted }}>
                        {goal.notes}
                      </p>
                    )}
                  </div>

                  {/* Daily Habit Check-In & Streak Button */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button
                      disabled={isDoneToday}
                      onClick={() => handleHabitCheckIn(goal.id)}
                      style={{
                        background: isDoneToday ? "#059669" : "#f1f5f9",
                        color: isDoneToday ? "#ffffff" : "#0a0a0a",
                        border: isDoneToday ? "none" : "1px solid #cbd5e1",
                        borderRadius: "16px",
                        padding: "0.35rem 0.8rem",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: isDoneToday ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        opacity: isDoneToday ? 0.9 : 1,
                        transition: "all 0.15s ease"
                      }}
                      title={isDoneToday ? "Daily habit completed for today! Check in again tomorrow." : "Click to check in your daily habit (+10% & streak)"}
                    >
                      <span>{isDoneToday ? "✓ Checked In Today" : "Check In Habit"}</span>
                      <span style={{ background: isDoneToday ? "rgba(255,255,255,0.25)" : "#e2e8f0", color: isDoneToday ? "#ffffff" : "#0a0a0a", padding: "0.05rem 0.45rem", borderRadius: "10px", fontSize: "0.68rem" }}>
                        🔥 {goal.current_streak || 0}d streak
                      </span>
                    </button>

                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}
                      title="Delete Goal"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Quick Adjustments */}
                <div style={{ marginTop: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", fontWeight: 600, color: GS.muted, marginBottom: "4px" }}>
                    <span>Progress: <strong>{goal.progress_percentage}%</strong></span>
                    {goal.target_date && <span>Target: {goal.target_date}</span>}
                  </div>

                  <div style={{ height: "7px", width: "100%", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden", marginBottom: "0.5rem" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${goal.progress_percentage}%`,
                        background: isCompleted ? "#10b981" : "linear-gradient(90deg, #0a0a0a 0%, #2563eb 100%)",
                        borderRadius: "4px",
                        transition: "width 0.3s ease"
                      }}
                    />
                  </div>

                  {!isCompleted && (
                    <div style={{ display: "flex", gap: "0.35rem", justifyContent: "flex-end" }}>
                      {[25, 50, 75, 100].map(pct => (
                        <button
                          key={pct}
                          onClick={() => handleUpdateProgress(goal.id, pct)}
                          style={{
                            background: goal.progress_percentage >= pct ? "#0a0a0a" : "#f1f5f9",
                            color: goal.progress_percentage >= pct ? "#ffffff" : "#475569",
                            border: "none",
                            borderRadius: "10px",
                            padding: "0.15rem 0.45rem",
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
