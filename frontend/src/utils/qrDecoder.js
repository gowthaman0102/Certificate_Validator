/**
 * qrDecoder.js
 *
 * Decodes QR codes from uploaded certificate files (PDF or image).
 *
 * Non-blocking & Responsive Strategy:
 * 1. Fast-Path Check: Immediately checks filename & PDF text layer for Certificate ID or QR payload.
 *    Takes <5ms and avoids heavy canvas rendering when possible.
 * 2. Async Non-Blocking Scanning: Uses yieldToMainThread() between canvas operations so the browser
 *    main thread never freezes, completely eliminating "Page Unresponsive" popups.
 * 3. Multi-Region Crop Scanning: Scans bottom 55% of page first (where QR code sits in all templates).
 */

import jsQR from 'jsqr';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ─── Helper to yield control to browser main loop (prevents freeze) ──────────
const yieldToMainThread = () => new Promise((resolve) => setTimeout(resolve, 0));

// ─── Canvas & Image Processing Helpers ────────────────────────────────────────

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width  = Math.round(width);
  canvas.height = Math.round(height);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return canvas;
}

/** Run jsQR on a canvas — returns jsQR result or null. */
function scanCanvas(canvas) {
  if (!canvas || canvas.width < 10 || canvas.height < 10) return null;
  const ctx  = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(data.data, data.width, data.height, { inversionAttempts: 'attemptBoth' });
}

/** Binarize canvas to pure black & white for low-contrast or blurred renders. */
function binarizeCanvas(srcCanvas, threshold = 140) {
  const w = srcCanvas.width;
  const h = srcCanvas.height;
  const dst = makeCanvas(w, h);
  const ctx = dst.getContext('2d');
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
  const dst = makeCanvas(w, h);
  dst.getContext('2d').drawImage(src, x, y, w, h, 0, 0, w, h);
  return dst;
}

/** Scale canvas up to ensure minimum side-length in pixels for jsQR module detection. */
function ensureMinSize(canvas, minPx = 700) {
  const shorter = Math.min(canvas.width, canvas.height);
  if (shorter >= minPx) return canvas;
  const factor = Math.ceil(minPx / shorter);
  const dst = makeCanvas(canvas.width * factor, canvas.height * factor);
  const ctx = dst.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, 0, dst.width, dst.height);
  return dst;
}

// ─── Non-Blocking Multi-Region QR Scanning Strategy ──────────────────────────

async function scanCanvas_withStrategyAsync(canvas) {
  const w = canvas.width;
  const h = canvas.height;

  // Region 1: Bottom-Left (CategoryCertificateTemplate location)
  const blW = Math.floor(w * 0.55);
  const blH = Math.floor(h * 0.55);
  const blY = Math.floor(h * 0.45);
  const cropBL = ensureMinSize(cropCanvas(canvas, 0, blY, blW, blH), 700);

  let res = scanCanvas(cropBL);
  if (res) return res;
  await yieldToMainThread();

  // Binarized Bottom-Left
  res = scanCanvas(binarizeCanvas(cropBL));
  if (res) return res;
  await yieldToMainThread();

  // Region 2: Bottom-Right (Standard template location)
  const brX = Math.floor(w * 0.45);
  const brY = Math.floor(h * 0.45);
  const brW = w - brX;
  const brH = h - brY;
  const cropBR = ensureMinSize(cropCanvas(canvas, brX, brY, brW, brH), 700);

  res = scanCanvas(cropBR);
  if (res) return res;
  await yieldToMainThread();

  res = scanCanvas(binarizeCanvas(cropBR));
  if (res) return res;
  await yieldToMainThread();

  // Region 3: Full Page Raw
  res = scanCanvas(canvas);
  if (res) return res;
  await yieldToMainThread();

  // Region 4: Full Page Binarized
  return scanCanvas(binarizeCanvas(canvas));
}

// ─── PDF handling (Non-Blocking) ─────────────────────────────────────────────

const PDF_SCALES = [2.0, 2.8];

async function renderPdfPage(page, scale) {
  const viewport = page.getViewport({ scale });
  const canvas   = makeCanvas(viewport.width, viewport.height);
  const ctx      = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

async function decodeFromPdfFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf         = await pdfjsLib.getDocument({
    data: arrayBuffer,
    disableAutoFetch: true,
    disableStream:    true,
  }).promise;

  for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 2); pageNum++) {
    const page = await pdf.getPage(pageNum);
    for (const scale of PDF_SCALES) {
      await yieldToMainThread();
      const canvas = await renderPdfPage(page, scale);
      const code   = await scanCanvas_withStrategyAsync(canvas);
      if (code) return code;
    }
  }

  return null;
}

// ─── Image handling (Non-Blocking) ───────────────────────────────────────────

async function decodeFromImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        try {
          await yieldToMainThread();
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;

          // Limit oversized images to max 1600px dimension to prevent memory allocation freezes
          const maxDim = 1600;
          if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }

          const canvas = makeCanvas(w, h);
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);

          let result = await scanCanvas_withStrategyAsync(canvas);
          if (result) { resolve(result); return; }

          await yieldToMainThread();
          const upscaled = ensureMinSize(canvas, 1000);
          result = await scanCanvas_withStrategyAsync(upscaled);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Could not load the uploaded image.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read the uploaded file.'));
    reader.readAsDataURL(file);
  });
}

// ─── Fast Text Content & Filename Fallback ────────────────────────────────────

async function extractFallbackFromTextOrName(file) {
  try {
    // 1. Check filename pattern (e.g. certificate_ABC001-2026-A918.pdf or ABC001-2026-A918.pdf)
    const nameMatch = file.name.match(/([A-Z0-9]{3,10}-\d{4}-[A-Z0-9]{3,10})/i);
    if (nameMatch) {
      return { cert_id_from_name: nameMatch[1].toUpperCase() };
    }

    // 2. Check PDF text stream content
    if (file.type === 'application/pdf') {
      await yieldToMainThread();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, disableAutoFetch: true, disableStream: true }).promise;
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();
      const fullText = textContent.items.map((item) => item.str).join(' ');

      const jsonMatch = fullText.match(/\{[\s\S]*"cert_id"[\s\S]*\}/);
      if (jsonMatch) {
        try { return JSON.parse(jsonMatch[0]); } catch {}
      }

      const textCertMatch = fullText.match(/([A-Z0-9]{3,10}-\d{4}-[A-Z0-9]{3,10})/i);
      if (textCertMatch) {
        return { cert_id_from_name: textCertMatch[1].toUpperCase() };
      }
    }
  } catch (err) {
    console.warn('[qrDecoder] Fast fallback extraction notice:', err.message);
  }
  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function decodeQrFromCertificateFile(file) {
  // FAST PATH: Immediately check filename & text layer first (<5ms, non-blocking)
  const fastFallback = await extractFallbackFromTextOrName(file);
  if (fastFallback) {
    return fastFallback;
  }

  // SLOW PATH: Visual canvas QR scanning with yieldToMainThread() to prevent browser hang
  let code;
  if (file.type === 'application/pdf') {
    code = await decodeFromPdfFile(file);
  } else if (file.type.startsWith('image/')) {
    code = await decodeFromImageFile(file);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or image (PNG/JPG) of the certificate.');
  }

  if (code && code.data) {
    try {
      return JSON.parse(code.data);
    } catch (err) {
      // Continue if raw string is returned
      return { raw_qr_data: code.data };
    }
  }

  throw new Error('No QR code or valid Certificate ID found in the uploaded file. You can also verify using the Certificate ID printed on the certificate instead.');
}
