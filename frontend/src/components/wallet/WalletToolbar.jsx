import { useState, useEffect } from "react";

const GS = { ink: "#0a0a0a", muted: "#666666", subtle: "#999999", border: "#0a0a0a", bg: "#ffffff" };

export default function WalletToolbar({
  certificates = [],
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  yearFilter,
  setYearFilter,
  onClearFilters,
  totalCount,
  filteredCount,
}) {
  const [localSearch, setLocalSearch] = useState(search || "");

  // Debounce search input (150ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch);
    }, 150);
    return () => clearTimeout(timer);
  }, [localSearch, setSearch]);

  // Sync external search updates
  useEffect(() => {
    setLocalSearch(search || "");
  }, [search]);

  // Determine available statuses in the current wallet
  const hasValid = certificates.some((c) => c.status === "VALID");
  const hasRevoked = certificates.some((c) => c.status === "REVOKED");

  // Extract unique issue years from certificates
  const years = Array.from(
    new Set(
      certificates
        .map((c) => {
          if (c.issue_date) {
            const yr = new Date(c.issue_date).getFullYear();
            if (!isNaN(yr)) return yr;
          }
          if (c.end_year) return parseInt(c.end_year, 10);
          return null;
        })
        .filter(Boolean)
    )
  ).sort((a, b) => b - a);

  const showYearFilter = years.length > 1;
  const isFiltered = localSearch || statusFilter !== "ALL" || sortBy !== "date_desc" || (yearFilter && yearFilter !== "ALL");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        width: "100%",
        marginBottom: "1rem",
        boxSizing: "border-box",
      }}
    >
      {/* Top Row: Search Input + Live Count */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search by course name or student name..."
          style={{
            flex: "1 1 260px",
            minWidth: "200px",
            background: GS.bg,
            border: `1.5px solid ${GS.border}`,
            borderRadius: "25px",
            padding: "0.6rem 1.25rem",
            color: GS.ink,
            fontSize: "0.88rem",
            fontFamily: "'Inter', sans-serif",
            outline: "none",
          }}
          id="wallet-search-input"
        />

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: GS.ink, whiteSpace: "nowrap" }}>
            Showing <strong>{filteredCount}</strong> of {totalCount} certificates
          </span>
          {isFiltered && (
            <button
              onClick={onClearFilters}
              style={{
                background: "transparent",
                border: `1px solid ${GS.border}`,
                borderRadius: "20px",
                padding: "0.25rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: GS.ink,
                cursor: "pointer",
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Status Pills + Sort + Year Filter */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
        {/* Status Pill Toggle Group */}
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "25px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              border: `1.5px solid ${GS.border}`,
              background: statusFilter === "ALL" ? GS.ink : GS.bg,
              color: statusFilter === "ALL" ? GS.bg : GS.ink,
              transition: "all 0.15s ease",
            }}
          >
            All
          </button>

          {hasValid && (
            <button
              type="button"
              onClick={() => setStatusFilter("VALID")}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "25px",
                fontSize: "0.78rem",
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
                padding: "0.4rem 1rem",
                borderRadius: "25px",
                fontSize: "0.78rem",
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

        {/* Sort & Year Dropdowns */}
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
          {showYearFilter && (
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{
                background: GS.bg,
                border: `1.5px solid ${GS.border}`,
                borderRadius: "25px",
                padding: "0.45rem 1rem",
                color: GS.ink,
                fontSize: "0.82rem",
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                cursor: "pointer",
                outline: "none",
              }}
              id="wallet-year-select"
            >
              <option value="ALL">All Years</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>
                  Year {y}
                </option>
              ))}
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: GS.bg,
              border: `1.5px solid ${GS.border}`,
              borderRadius: "25px",
              padding: "0.45rem 1rem",
              color: GS.ink,
              fontSize: "0.82rem",
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              outline: "none",
            }}
            id="wallet-sort-select"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="course_asc">Course A–Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}
