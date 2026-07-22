import { forwardRef } from 'react';
import { getCertificateBody } from '../utils/certificateCategory';

const CertificateTemplate = forwardRef(function CertificateTemplate({ certificate, qrCodeUrl }, ref) {
  // Derives all dynamic text from the shared utility — one source of truth
  const { heading, preText, prominentText, postText } = getCertificateBody(certificate);

  return (
    <div
      ref={ref}
      style={{
        width: '800px',
        minHeight: '560px',
        background: '#F8F3E7',
        border: '10px solid #16233F',
        outline: '2px solid #B98F33',
        outlineOffset: '-16px',
        padding: '48px 56px',
        fontFamily: "'EB Garamond', serif",
        color: '#16233F',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Header — now dynamic based on certificate category ── */}
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <div style={{ fontSize: '13px', letterSpacing: '3px', color: '#B98F33', marginBottom: '6px' }}>
          {heading}
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 600, color: '#16233F' }}>
          {certificate.university_name || certificate.issuer_id}
        </div>
        <div style={{ width: '90px', height: '2px', background: '#B98F33', margin: '12px auto' }} />
      </div>

      {/* ── Body — dynamic per category ── */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{ fontSize: '15px', color: '#2B3B5C' }}>This is to certify that</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 700, color: '#6E1F2B', margin: '10px 0' }}>
          {certificate.student_name}
        </div>
        <div style={{ fontSize: '13px', color: '#2B3B5C', marginBottom: '6px' }}>
          Register No: {certificate.register_number}
        </div>

        {/* Pre-text sentence */}
        <div style={{ fontSize: '15px', color: '#2B3B5C', lineHeight: '1.6' }}>
          {preText}
        </div>

        {/* Prominent text — the course / detail / purpose */}
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 600, color: '#16233F', margin: '8px 0' }}>
          {prominentText}
        </div>

        {/* CGPA — shown only when present */}
        {certificate.cgpa && (
          <div style={{ fontSize: '14px', color: '#2B3B5C' }}>
            CGPA: {certificate.cgpa}
          </div>
        )}

        {/* Post-text (year range, purpose line, etc.) — shown only when present */}
        {postText && (
          <div style={{ fontSize: '14px', color: '#2B3B5C', marginTop: '6px', fontStyle: 'italic' }}>
            {postText}
          </div>
        )}
      </div>

      {/* ── Footer — identical to original (cert ID, issue date, QR code) ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: '32px',
        paddingTop: '20px',
        borderTop: '1px solid #C9BFA4',
      }}>
        <div style={{ fontSize: '13px', color: '#2B3B5C', lineHeight: '1.8' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#16233F' }}>
            Certificate ID: {certificate.certificate_number}
          </div>
          <div><strong>Issue Date:</strong> {certificate.issue_date}</div>
          <div><strong>Status:</strong> {certificate.status}</div>
          {/* Show category in small print for context */}
          {certificate.certificate_category && (
            <div style={{ marginTop: '4px', color: '#5a6a7a', fontSize: '11px' }}>
              {certificate.certificate_category}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          {qrCodeUrl && (
            <img
              src={qrCodeUrl}
              alt="Certificate QR Code"
              crossOrigin="anonymous"
              style={{
                width: '150px',
                height: '150px',
                display: 'block',
                margin: '0 auto 6px',
                imageRendering: 'pixelated',
                background: '#ffffff',
                padding: '6px',
                border: '1px solid #C9BFA4',
              }}
            />
          )}
          <div style={{ fontSize: '11px', color: '#2B3B5C' }}>Scan to verify</div>
        </div>
      </div>
    </div>
  );
});

export default CertificateTemplate;
