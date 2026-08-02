export function SkeletonCard({
  rows      = 3,
  heights   = [],
  gap       = "0.65rem",
  className = "",
  style     = {},
}) {
  const defaultHeights = Array.from({ length: rows }, (_, i) =>
    i === 0 ? "1.4rem" : "1rem"
  );
  const rowHeights = heights.length ? heights : defaultHeights;

  return (
    <div
      className={`skeleton-group ${className}`}
      style={{ gap, ...style }}
      aria-hidden="true"
    >
      {rowHeights.map((h, i) => (
        <span
          key={i}
          className="skeleton"
          style={{
            height: h,
            width: i === rowHeights.length - 1 ? "60%" : "100%",
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonLine({ width = "100%", height = "1rem", style = {} }) {
  return (
    <span
      className="skeleton"
      style={{ width, height, display: "block", ...style }}
      aria-hidden="true"
    />
  );
}

export function SkeletonStat() {
  return (
    <div className="skeleton-group" style={{ gap: "0.5rem" }}>
      <span className="skeleton" style={{ height: "2.2rem", width: "60%" }} />
      <span className="skeleton" style={{ height: "0.85rem", width: "40%" }} />
    </div>
  );
}

export default SkeletonCard;
