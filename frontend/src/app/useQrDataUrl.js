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
        let qrContent = '';

        if (cert?.qr_data) {
          // Use the full QR payload string stored in DB — preserves verifiability
          qrContent = typeof cert.qr_data === 'string' ? cert.qr_data : JSON.stringify(cert.qr_data);
        } else if (cert?.certificate_number) {
          qrContent = cert.certificate_number;
        } else if (cert?.id) {
          qrContent = cert.id;
        } else {
          return;
        }

        const url = await QRCode.toDataURL(qrContent, {
          width: 300,
          margin: 1,
          errorCorrectionLevel: 'H',
          color: { dark: '#0a0a0a', light: '#ffffff' },
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
