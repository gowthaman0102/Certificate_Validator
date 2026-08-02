import { useRef, useState, useEffect, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion, AnimatePresence } from "framer-motion";
import WalletCertCard from "./WalletCertCard";

const VIRTUALIZATION_THRESHOLD = 12;

function VirtualizedRowsInner({ rows, columnCount, onDownload }) {
  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => window,
    estimateSize: () => 260,
    overscan: 3,
  });

  return (
    <div ref={parentRef} style={{ width: "100%", position: "relative" }}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowItems = rows[virtualRow.index] || [];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: "1.25rem",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                  gap: "1.25rem",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                {rowItems.map((cert) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    <WalletCertCard cert={cert} onDownload={onDownload} />
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function VirtualizedCertGrid({ filteredCertificates = [], onDownload }) {
  const containerRef = useRef(null);
  const [columnCount, setColumnCount] = useState(3);

  // Responsive column count detector
  useEffect(() => {
    function updateColumns() {
      const width = containerRef.current ? containerRef.current.offsetWidth : (typeof window !== "undefined" ? window.innerWidth : 1200);
      if (width < 640) {
        setColumnCount(1);
      } else if (width <= 1024) {
        setColumnCount(2);
      } else {
        setColumnCount(3);
      }
    }

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  // Partition filtered certificates into row chunks based on active column count
  const rows = useMemo(() => {
    const chunked = [];
    for (let i = 0; i < filteredCertificates.length; i += columnCount) {
      chunked.push(filteredCertificates.slice(i, i + columnCount));
    }
    return chunked;
  }, [filteredCertificates, columnCount]);

  const isVirtualized = filteredCertificates.length > VIRTUALIZATION_THRESHOLD;

  if (isVirtualized) {
    return (
      <div ref={containerRef} style={{ width: "100%" }}>
        <VirtualizedRowsInner rows={rows} columnCount={columnCount} onDownload={onDownload} />
      </div>
    );
  }

  // Standard CSS Grid for <= 12 items
  return (
    <div ref={containerRef} className="wallet-cert-grid" style={{ width: "100%" }}>
      <AnimatePresence>
        {filteredCertificates.map((cert) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <WalletCertCard cert={cert} onDownload={onDownload} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
