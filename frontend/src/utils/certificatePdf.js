import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function downloadCertificateAsPDF(elementRef, filename) {
  const element = elementRef.current;
  if (!element) return;

  // Wait for the custom fonts (Cormorant Garamond, EB Garamond) to actually finish loading,
  // otherwise html2canvas captures before layout settles and text overlaps.
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // Wait for the embedded QR image to finish loading too
  const img = element.querySelector('img');
  if (img && !img.complete) {
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  }

  // Extra safety tick to let the browser finish painting
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#F8F3E7',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(`${filename}.pdf`);
}
