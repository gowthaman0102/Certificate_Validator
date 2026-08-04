import { useState, useEffect } from "react";

const GS = { ink: "#0a0a0a", muted: "#666666", subtle: "#999999", border: "#0a0a0a", bg: "#ffffff" };

/**
 * Derives a compact type label and a one-line contextual description
 * from certificate_category + certificate_detail + course.
 *
 * Returns:
 *   typeTag  — short 2–5 word badge shown top-right of each row
 *   detail   — one-line contextual description shown below the course name
 */
function getIndexRowInfo(cert) {
  const category = (cert.certificate_category || "Course Completion Certificate").trim();
  const rawDetail = (cert.certificate_detail || "").trim();
  const course = (cert.course || "").trim();

  switch (category) {
    case "Degree / Graduation Certificate":
      return { typeTag: "DEGREE", detail: course ? `Dept. of ${course}` : "" };

    case "Course Completion Certificate":
      return { typeTag: "COURSE", detail: rawDetail || course };

    case "Merit Certificate":
      return { typeTag: "MERIT", detail: rawDetail || course };

    case "Distinction Certificate":
      return { typeTag: "DIST", detail: rawDetail || course };

    case "Academic Excellence Certificate":
      return { typeTag: "EXCEL", detail: rawDetail || course };

    case "Internship Completion Certificate":
      return { typeTag: "INTERN", detail: rawDetail || "Internship Programme" };

    case "Project Completion Certificate":
      return { typeTag: "PROJECT", detail: rawDetail || "Project Completion" };

    case "Participation Certificate": {
      const d = rawDetail.toLowerCase();
      if (d.includes("workshop") || d.includes("seminar") || d.includes("webinar")) {
        return { typeTag: "WKSHP", detail: rawDetail };
      }
      if (d.includes("contest") || d.includes("competition") || d.includes("olympiad")) {
        return { typeTag: "COMP", detail: rawDetail };
      }
      // All other participation certs → hackathon
      return { typeTag: "Hackathon", detail: rawDetail || "Hackathon Event" };
    }

    case "Bonafide Certificate":
      return { typeTag: "BONAF", detail: rawDetail ? `Reason: ${rawDetail}` : "Official Bonafide" };

    default:
      return { typeTag: "CERT", detail: rawDetail || course };
  }
}

/**
 * Display title for each row. For Hackathon, suppress the event name
 * and show "Hackathon Certificate" instead (as per user spec).
 * For everything else, show course name.
 */
function getDisplayTitle(cert) {
  const category = (cert.certificate_category || "").trim();
  const rawDetail = (cert.certificate_detail || "").trim();
  const course = (cert.course || "").trim();

  // For ALL certificate types, show the course/department as the title
  return course;
}

export default function WalletIndexList({
  certificates = [],
  filteredCertificates = [],
  selectedCertId,
  onSelectCert,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onClearFilters,
}) {
  const [localSearch, setLocalSearch] = useState(search || "");

  // Debounced search input (150ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch);
    }, 150);
    return () => clearTimeout(timer);
  }, [localSearch, setSearch]);

  useEffect(() => {
    setLocalSearch(search || "");
  }, [search]);

  // Determine available statuses in current wallet
  const hasValid = certificates.some((c) => c.status === "VALID");
  const hasRevoked = certificates.some((c) => c.status === "REVOKED");

  // Keyboard Navigation (Up/Down arrow keys move selection in list)
  useEffect(() => {
    function handleKeyDown(e) {
      if (filteredCertificates.length === 0) return;
      if (document.activeElement && document.activeElement.tagName === "INPUT") return;

      const currentIndex = filteredCertificates.findIndex((c) => c.id === selectedCertId);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, filteredCertificates.length - 1);
        if (filteredCertificates[nextIndex]) onSelectCert(filteredCertificates[nextIndex].id);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        if (filteredCertificates[prevIndex]) onSelectCert(filteredCertificates[prevIndex].id);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredCertificates, selectedCertId, onSelectCert]);

  function fmt(d) {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  }

  return (
    <div className="wallet-index-pane">
      {/* Pinned Search Input */}
      <input
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Filter by course or type..."
        style={{
          width: "100%",
          background: GS.bg,
          border: `1.5px solid #d1d5db`,
          borderRadius: "10px",
          padding: "0.5rem 0.85rem",
          color: GS.ink,
          fontSize: "0.83rem",
          fontFamily: "'Inter', sans-serif",
          outline: "none",
          boxSizing: "border-box",
        }}
        id="wallet-index-search"
      />

      {/* Compact Status Filter Pills */}
      <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          style={{
            padding: "0.25rem 0.65rem",
            borderRadius: "20px",
            fontSize: "0.7rem",
            fontWeight: 700,
            cursor: "pointer",
            border: `1.5px solid ${GS.border}`,
            background: statusFilter === "ALL" ? GS.ink : GS.bg,
            color: statusFilter === "ALL" ? GS.bg : GS.ink,
            transition: "all 0.15s ease",
          }}
        >
          All ({certificates.length})
        </button>

        {hasValid && (
          <button
            type="button"
            onClick={() => setStatusFilter("VALID")}
            style={{
              padding: "0.25rem 0.65rem",
              borderRadius: "20px",
              fontSize: "0.7rem",
              fontWeight: 700,
              cursor: "pointer",
              border: `1.5px solid ${GS.border}`,
              background: statusFilter === "VALID" ? GS.ink : GS.bg,
              color: statusFilter === "VALID" ? GS.bg : GS.ink,
              transition: "all 0.15s ease",
            }}
          >
            Valid
          </button>
        )}

        {hasRevoked && (
          <button
            type="button"
            onClick={() => setStatusFilter("REVOKED")}
            style={{
              padding: "0.25rem 0.65rem",
              borderRadius: "20px",
              fontSize: "0.7rem",
              fontWeight: 700,
              cursor: "pointer",
              border: `1.5px solid ${GS.border}`,
              background: statusFilter === "REVOKED" ? GS.ink : GS.bg,
              color: statusFilter === "REVOKED" ? GS.bg : GS.ink,
              transition: "all 0.15s ease",
            }}
          >
            Revoked
          </button>
        )}
      </div>

      {/* Count Subtitle */}
      <div style={{ fontSize: "0.72rem", color: GS.muted, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
        <span>Master Index</span>
        <span>{filteredCertificates.length} items</span>
      </div>

      {/* Independently Scrollable Dense List */}
      <div className="wallet-index-list">
        {filteredCertificates.length === 0 ? (
          <div style={{ padding: "1.5rem 0.5rem", textAlign: "center", color: GS.muted, fontSize: "0.82rem" }}>
            <p style={{ margin: "0 0 0.5rem 0", fontWeight: 700, color: GS.ink }}>No matches</p>
            <button className="btn-secondary" onClick={onClearFilters} style={{ fontSize: "0.72rem", padding: "0.25rem 0.65rem" }}>
              Clear filters
            </button>
          </div>
        ) : (
          filteredCertificates.map((cert) => {
            const isSelected = cert.id === selectedCertId;
            const { typeTag, detail } = getIndexRowInfo(cert);
            const displayTitle = getDisplayTitle(cert);

            return (
              <div
                key={cert.id}
                onClick={() => onSelectCert(cert.id)}
                className={`wallet-index-row${isSelected ? " selected" : ""}`}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelectCert(cert.id); }}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}
              >
                {/* LEFT: course/dept name + issue date */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "3px" }}>
                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: isSelected ? 800 : 700,
                      color: isSelected ? "#ffffff" : GS.ink,
                      lineHeight: 1.35,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      wordBreak: "break-word",
                    }}
                  >
                    {displayTitle}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: isSelected ? "rgba(255,255,255,0.6)" : GS.muted }}>
                    {fmt(cert.issue_date)}
                  </span>
                </div>

                {/* RIGHT: type tag + event detail */}
                <div style={{ flexShrink: 0, width: "105px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  {/* Type tag */}
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.58rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      padding: "2px 7px",
                      borderRadius: "5px",
                      background: isSelected ? "rgba(255,255,255,0.18)" : "#e2e8f0",
                      color: isSelected ? "rgba(255,255,255,0.9)" : GS.muted,
                      whiteSpace: "nowrap",
                    }}
                    title={typeTag}
                  >
                    {typeTag}
                  </span>
                  {/* Event / detail name — right-aligned, clean ellipsis */}
                  {detail && (
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontStyle: "italic",
                        color: isSelected ? "rgba(255,255,255,0.65)" : GS.subtle,
                        lineHeight: 1.3,
                        textAlign: "right",
                        paddingRight: "2px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      }}
                      title={detail}
                    >
                      {detail}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
