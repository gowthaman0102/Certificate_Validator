import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Converts an image URL to a base64 data URL.
 * This avoids all cross-origin / CORS issues with html2canvas
 * because the <img> src becomes an inline data URL.
 */
async function toDataUrl(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Downloads the certificate DOM element as a PDF.
 *
 * Key steps:
 * 1. Swap the QR <img> src to a data URL so html2canvas never makes
 *    cross-origin requests (which silently render as blank).
 * 2. Wait for fonts + rAF settle.
 * 3. Capture at scale 4 for crisp QR modules.
 * 4. Restore the original src afterward.
 *
 * @param {React.RefObject} elementRef  - ref to the CertificateTemplate DOM node
 * @param {string}          filename    - output filename (without .pdf)
 */
export async function downloadCertificateAsPDF(elementRef, filename) {
  const element = elementRef.current;
  if (!element) return;

  // ── Step 1: Replace <img> src with inline data URL ────────────────────────
  const img = element.querySelector('img');
  let originalSrc = null;
  if (img && img.src && img.src.startsWith('http')) {
    try {
      originalSrc = img.src;
      const dataUrl = await toDataUrl(img.src);
      img.src = dataUrl;
      // Wait for the browser to process the new src
      await new Promise((resolve) => {
        if (img.complete) { resolve(); return; }
        img.onload  = resolve;
        img.onerror = resolve;
      });
    } catch (err) {
      // Non-fatal — proceed anyway; QR might still be readable
      console.warn('[pdf] Could not convert QR to data URL:', err.message);
    }
  }

  // ── Step 2: Wait for fonts ────────────────────────────────────────────────
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // ── Step 3: Two rAF ticks to let layout settle ────────────────────────────
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  // ── Step 4: Capture at scale 4 ────────────────────────────────────────────
  let canvas;
  try {
    canvas = await html2canvas(element, {
      scale: 4,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
    });
  } finally {
    // ── Step 5: Restore original src ─────────────────────────────────────────
    if (originalSrc && img) {
      img.src = originalSrc;
    }
  }

  // ── Step 6: Create PDF ────────────────────────────────────────────────────
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(`${filename}.pdf`);
}
