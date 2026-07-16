import jsQR from 'jsqr';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function scanCanvasForQr(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
}

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return canvas;
}

function decodeFromImageElement(img) {
  const canvas = makeCanvas(img.width, img.height);
  canvas.getContext('2d').drawImage(img, 0, 0);
  return scanCanvasForQr(canvas);
}

async function decodeFromImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(decodeFromImageElement(img));
      img.onerror = () => reject(new Error('Could not load the uploaded image.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read the uploaded file.'));
    reader.readAsDataURL(file);
  });
}

async function renderPdfPageToCanvas(page, scale) {
  const viewport = page.getViewport({ scale });
  const canvas = makeCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

// DEBUG: returns the first rendered page as a data URL so we can visually inspect it
export async function debugRenderPdfFirstPage(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const canvas = await renderPdfPageToCanvas(page, 2);
  return { dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height, numPages: pdf.numPages };
}

async function decodeFromPdfFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pagesToCheck = Math.min(pdf.numPages, 3);
  const scalesToTry = [2, 3, 1.5, 4];

  for (let pageNum = 1; pageNum <= pagesToCheck; pageNum++) {
    const page = await pdf.getPage(pageNum);
    for (const scale of scalesToTry) {
      const canvas = await renderPdfPageToCanvas(page, scale);
      const code = scanCanvasForQr(canvas);
      if (code) return code;
    }
  }
  return null;
}

export async function decodeQrFromCertificateFile(file) {
  let code;

  if (file.type === 'application/pdf') {
    code = await decodeFromPdfFile(file);
  } else if (file.type.startsWith('image/')) {
    code = await decodeFromImageFile(file);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or image (PNG/JPG) of the certificate.');
  }

  if (!code) {
    throw new Error('No QR code found in the uploaded file. You can also verify using the Certificate ID printed on the certificate instead.');
  }

  try {
    return JSON.parse(code.data);
  } catch (err) {
    throw new Error('QR code found, but its contents are not valid certificate data.');
  }
}
