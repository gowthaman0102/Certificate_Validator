import { useState, useEffect } from "react";
import API from "../../api/client";

const GS = { ink: "#0a0a0a", muted: "#64748b", subtle: "#94a3b8", border: "#e2e8f0", bg: "#ffffff" };

const PORTFOLIO_LINK_TYPES = [
  { id: "github", label: "GitHub", placeholder: "https://github.com/username" },
  { id: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { id: "website", label: "Portfolio Website", placeholder: "https://yourportfolio.dev" },
  { id: "resume", label: "Resume / CV", placeholder: "https://drive.google.com/your-resume.pdf" },
  { id: "research", label: "Research Papers", placeholder: "https://scholar.google.com/citations?user=..." },
  { id: "kaggle", label: "Kaggle", placeholder: "https://kaggle.com/username" },
];

export default function PortfolioLinksCard() {
  const [links, setLinks] = useState([]);
  const [editingType, setEditingType] = useState(null);
  const [inputUrl, setInputUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLinks();
  }, []);

  async function loadLinks() {
    try {
      const res = await API.get("/passport/portfolio-links");
      setLinks(res.data?.data || []);
    } catch {}
  }

  async function handleSaveLink(linkType) {
    if (!inputUrl.trim()) return;
    setSaving(true);
    try {
      await API.post("/passport/portfolio-links", { link_type: linkType, url: inputUrl.trim() });
      setEditingType(null);
      setInputUrl("");
      loadLinks();
    } catch {
      alert("Failed to save link");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLink(id) {
    try {
      await API.delete(`/passport/portfolio-links/${id}`);
      loadLinks();
    } catch {
      alert("Failed to delete link");
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
      {PORTFOLIO_LINK_TYPES.map((item) => {
        const existing = links.find((l) => l.link_type === item.id);

        return (
          <div
            key={item.id}
            style={{
              background: existing ? "#ffffff" : "#f8fafc",
              border: existing ? "1.5px solid #0a0a0a" : "1px dashed #cbd5e1",
              borderRadius: "12px",
              padding: "0.9rem 1.1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.45rem",
              boxShadow: existing ? "0 2px 6px rgba(0,0,0,0.04)" : "none"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0a0a0a" }}>
                {item.label}
              </span>

              {existing && (
                <button
                  onClick={() => handleDeleteLink(existing.id)}
                  style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700 }}
                  title="Remove Link"
                >
                  ✕
                </button>
              )}
            </div>

            {editingType === item.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "4px" }}>
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder={item.placeholder}
                  autoFocus
                  style={{ fontSize: "0.8rem", padding: "0.35rem 0.55rem", border: "1px solid #0a0a0a", borderRadius: "6px" }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveLink(item.id); if (e.key === "Escape") setEditingType(null); }}
                />
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button className="btn" style={{ fontSize: "0.72rem", padding: "0.2rem 0.55rem" }} onClick={() => handleSaveLink(item.id)} disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button className="btn-secondary" style={{ fontSize: "0.72rem", padding: "0.2rem 0.55rem" }} onClick={() => setEditingType(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : existing ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                <a
                  href={existing.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 600, wordBreak: "break-all", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "190px" }}
                >
                  {existing.url.replace(/^https?:\/\//, '')}
                </a>
                <button
                  onClick={() => { setInputUrl(existing.url); setEditingType(item.id); }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: GS.muted, fontSize: "0.75rem" }}
                  title="Edit Link"
                >
                  Edit
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setInputUrl(""); setEditingType(item.id); }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: GS.muted,
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textAlign: "left",
                  padding: "0.2rem 0",
                  marginTop: "2px"
                }}
              >
                + Add {item.label}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
