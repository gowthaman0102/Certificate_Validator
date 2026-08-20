/**
 * useQrDataUrl.js
 * Shared hook — generates an inline QR code Data URL from a certificate record.
 *
 * Priority order:
 *  1. If qrCodeUrl prop was explicitly passed (not null), use it directly
 *  2. Generate QR from cert.qr_data (JSON string stored in DB)
 *  3. Fall back to certificate_number or cert id
 */
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

/**
 * @param {object} cert - Certificate object (must have qr_data, id, and/or certificate_number)
 * @param {string|null} qrCodeUrlProp - Explicit qrCodeUrl override prop (pass null if not provided)
 * @returns {string} - A data URL (data:image/png;base64,...) or empty string while loading
 */
export function useQrDataUrl(cert, qrCodeUrlProp) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (qrCodeUrlProp) {
      // If caller explicitly provided a URL, use it directly
      setDataUrl(qrCodeUrlProp);
      return;
    }

    let cancelled = false;

    async function generate() {
      try {
        let certNum = cert?.certificate_number || cert?.id || cert?.cert_id || '';

        if (!certNum && cert?.qr_data) {
          try {
            const parsed = typeof cert.qr_data === 'string' ? JSON.parse(cert.qr_data) : cert.qr_data;
            certNum = parsed.certificate_number || parsed.cert_id || parsed.id || '';
          } catch {}
        }

        let qrContent = '';

        if (certNum) {
          // Construct clean, mobile-scannable Verification URL for external phone cameras
          const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
          qrContent = `${origin}/verify?cert_number=${encodeURIComponent(certNum)}`;
        } else if (cert?.qr_data) {
          qrContent = typeof cert.qr_data === 'string' ? cert.qr_data : JSON.stringify(cert.qr_data);
        } else {
          return;
        }

        // Generate crisp, optimal-density QR code (Level M = 15% error correction, Version 3 matrix)
        const url = await QRCode.toDataURL(qrContent, {
          width: 400,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: { dark: '#000000', light: '#ffffff' },
        });

        if (!cancelled) setDataUrl(url);
      } catch (err) {
        console.error('[useQrDataUrl] Failed to generate QR code:', err);
      }
    }

    generate();
    return () => { cancelled = true; };
  }, [cert?.id, cert?.certificate_number, cert?.qr_data, qrCodeUrlProp]);

  return dataUrl;
}
