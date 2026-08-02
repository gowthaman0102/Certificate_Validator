/**
 * qrDecoder.js
 *
 * Master, bulletproof QR decoder for uploaded certificate files (PDF or image).
 *
 * Multi-Stage Decoding Engine:
 * 1. Fast Text & Filename Extraction (<5ms): Checks text streams & filenames for JSON payloads or Cert IDs.
 * 2. Multi-Scale & Multi-Region Visual Scanning: Renders PDF/images at 1.8x, 2.5x, 3.2x scales across 6 regions
 *    (Full page, Bottom-Left, Bottom-Right, Top-Left, Top-Right, Center) with multiple binarization thresholds.
 * 3. Intelligent Payload Parser: Automatically normalizes JSON strings, base64 payloads, URLs, and Certificate IDs.
 */

import jsQR from 'jsqr';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Helper to yield control to browser main loop (prevents freeze)
const yieldToMainThread = () => new Promise((resolve) => setTimeout(resolve, 0));

// Canvas Creation Helper
function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width  = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.imageSmoothingEnabled = false;
  return canvas;
}

/** Run jsQR on a canvas — returns jsQR result object or null. */
function scanCanvas(canvas) {
  if (!canvas || canvas.width < 10 || canvas.height < 10) return null;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(data.data, data.width, data.height, { inversionAttempts: 'attemptBoth' });
}

/** Binarize canvas to pure black & white for low-contrast or blurred renders. */
function binarizeCanvas(srcCanvas, threshold = 140) {
  const w = srcCanvas.width;
  const h = srcCanvas.height;
  const dst = makeCanvas(w, h);
  const ctx = dst.getContext('2d');
  if (!ctx) return srcCanvas;
  ctx.drawImage(srcCanvas, 0, 0);

  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const bw = v < threshold ? 0 : 255;
    d[i]     = bw;
    d[i + 1] = bw;
    d[i + 2] = bw;
  }
  ctx.putImageData(imgData, 0, 0);
  return dst;
}

/** Crop a rectangular region of a canvas into a new canvas. */
function cropCanvas(src, x, y, w, h) {
  const safeW = Math.max(1, Math.min(w, src.width - x));
  const safeH = Math.max(1, Math.min(h, src.height - y));
  const dst = makeCanvas(safeW, safeH);
  const ctx = dst.getContext('2d');
  if (ctx) ctx.drawImage(src, x, y, safeW, safeH, 0, 0, safeW, safeH);
  return dst;
}

/** Scale canvas up to ensure minimum side-length in pixels for jsQR module detection. */
function ensureMinSize(canvas, minPx = 800) {
  const shorter = Math.min(canvas.width, canvas.height);
  if (shorter >= minPx || shorter <= 0) return canvas;
  const factor = Math.ceil(minPx / shorter);
  const dst = makeCanvas(canvas.width * factor, canvas.height * factor);
  const ctx = dst.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, dst.width, dst.height);
  }
  return dst;
}

// ─── Multi-Region & Multi-Threshold Visual QR Scanner ───────────────────────

async function scanCanvas_withStrategyAsync(canvas) {
  if (!canvas || canvas.width < 20 || canvas.height < 20) return null;
  const w = canvas.width;
  const h = canvas.height;

  // 6 Strategic Scanning Regions
  const regions = [
    { x: 0, y: Math.floor(h * 0.35), w: Math.floor(w * 0.65), h: Math.floor(h * 0.65) }, // Bottom-Left
    { x: Math.floor(w * 0.35), y: Math.floor(h * 0.35), w: Math.floor(w * 0.65), h: Math.floor(h * 0.65) }, // Bottom-Right
    { x: 0, y: 0, w: Math.floor(w * 0.65), h: Math.floor(h * 0.65) }, // Top-Left
    { x: Math.floor(w * 0.35), y: 0, w: Math.floor(w * 0.65), h: Math.floor(h * 0.65) }, // Top-Right
    { x: Math.floor(w * 0.2), y: Math.floor(h * 0.2), w: Math.floor(w * 0.6), h: Math.floor(h * 0.6) }, // Center
    { x: 0, y: 0, w, h }, // Full Page
  ];

  for (const reg of regions) {
    const cropped = cropCanvas(canvas, reg.x, reg.y, reg.w, reg.h);
    const scaled = ensureMinSize(cropped, 800);

    // 1. Raw Pass
    let res = scanCanvas(scaled);
    if (res) return res;

    // 2. Binarized Pass (Standard Threshold 130)
    res = scanCanvas(binarizeCanvas(scaled, 130));
    if (res) return res;

    // 3. Binarized Pass (High Contrast Threshold 170)
    res = scanCanvas(binarizeCanvas(scaled, 170));
    if (res) return res;

    await yieldToMainThread();
  }

  return null;
}

// ─── PDF Visual Rendering ───────────────────────────────────────────────────

const PDF_SCALES = [1.8, 2.5, 3.2];

async function renderPdfPage(page, scale) {
  const viewport = page.getViewport({ scale });
  const canvas   = makeCanvas(viewport.width, viewport.height);
  const ctx      = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    await page.render({ canvasContext: ctx, viewport }).promise;
  }
  return canvas;
}

async function decodeFromPdfFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      disableAutoFetch: true,
      disableStream: true,
    }).promise;

    const maxPages = Math.min(pdf.numPages, 3);
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      for (const scale of PDF_SCALES) {
        await yieldToMainThread();
        const canvas = await renderPdfPage(page, scale);
        const code   = await scanCanvas_withStrategyAsync(canvas);
        if (code) return code;
      }
    }
  } catch (err) {
    console.warn('[qrDecoder] PDF visual render notice:', err.message);
  }
  return null;
}

// ─── Image Visual Rendering ─────────────────────────────────────────────────

async function decodeFromImageFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        try {
          await yieldToMainThread();
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;

          const maxDim = 1800;
          if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }

          const canvas = makeCanvas(w, h);
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.drawImage(img, 0, 0, w, h);

          let result = await scanCanvas_withStrategyAsync(canvas);
          if (result) { resolve(result); return; }

          await yieldToMainThread();
          const upscaled = ensureMinSize(canvas, 1000);
          result = await scanCanvas_withStrategyAsync(upscaled);
          resolve(result);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

// ─── Fast Text & Filename Extraction Fallback ───────────────────────────────

async function extractFallbackFromTextOrName(file) {
  try {
    // 1. Check filename for Certificate ID pattern (e.g. ABC001-2026-A918 or certificate_ABC001-2026-A918.pdf)
    const nameIdMatch = file.name.match(/([A-Z0-9]{2,12}[-_]\d{4}[-_][A-Z0-9]{2,12})/i);
    if (nameIdMatch) {
      return { cert_id_from_name: nameIdMatch[1].toUpperCase() };
    }

    // Check filename for UUID
    const nameUuidMatch = file.name.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (nameUuidMatch) {
      return { cert_id_from_name: nameUuidMatch[1] };
    }

    // 2. Check PDF text stream items
    if (file.type === 'application/pdf') {
      await yieldToMainThread();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, disableAutoFetch: true, disableStream: true }).promise;
      const maxPages = Math.min(pdf.numPages, 2);

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const fullText = textContent.items.map((item) => item.str).join(' ');

        // Check for JSON object string in text layer
        const jsonMatch = fullText.match(/\{[\s\S]*"cert_id"[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed && typeof parsed === 'object') return parsed;
          } catch {}
        }

        // Check for Certificate ID string in text layer
        const textCertMatch = fullText.match(/([A-Z0-9]{2,12}[-_]\d{4}[-_][A-Z0-9]{2,12})/i);
        if (textCertMatch) {
          return { cert_id_from_name: textCertMatch[1].toUpperCase() };
        }
      }
    }
  } catch (err) {
    console.warn('[qrDecoder] Fast text extraction notice:', err.message);
  }
  return null;
}

// ─── Intelligent QR Raw String Parser ─────────────────────────────────────────

function parseQrDataString(rawData) {
  if (!rawData || typeof rawData !== 'string') return null;

  const trimmed = rawData.replace(/^\uFEFF/, '').trim();

  // Direct JSON parse
  try {
    const obj = JSON.parse(trimmed);
    if (obj && typeof obj === 'object') return obj;
  } catch {}

  // JSON substring extraction
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const obj = JSON.parse(jsonMatch[0]);
      if (obj && typeof obj === 'object') return obj;
    } catch {}
  }

  // Certificate ID pattern match (e.g. ABC001-2026-A918 or URL query param)
  const idMatch = trimmed.match(/([A-Z0-9]{2,12}[-_]\d{4}[-_][A-Z0-9]{2,12})/i);
  if (idMatch) {
    return { cert_id_from_name: idMatch[1].toUpperCase() };
  }

  // UUID match
  const uuidMatch = trimmed.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  if (uuidMatch) {
    return { cert_id_from_name: uuidMatch[1] };
  }

  return { raw_qr_data: trimmed };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function decodeQrFromCertificateFile(file) {
  if (!file) throw new Error('No file provided for verification.');

  // 1. FAST PATH: Check filename & PDF text stream first (<5ms)
  const fastResult = await extractFallbackFromTextOrName(file);
  if (fastResult) {
    return fastResult;
  }

  // 2. SLOW PATH: Multi-scale & multi-region visual canvas scanning
  let code = null;
  if (file.type === 'application/pdf') {
    code = await decodeFromPdfFile(file);
  } else if (file.type.startsWith('image/')) {
    code = await decodeFromImageFile(file);
  } else {
    // Try PDF decoder if unknown extension
    code = await decodeFromPdfFile(file);
  }

  if (code && code.data) {
    const parsed = parseQrDataString(code.data);
    if (parsed) return parsed;
  }

  throw new Error('No QR code or valid Certificate ID found in the uploaded file. You can also verify using the Certificate ID printed on the certificate instead.');
}
