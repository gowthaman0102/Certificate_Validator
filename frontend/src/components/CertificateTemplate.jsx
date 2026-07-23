import { forwardRef } from 'react';
import { getCertificateBody } from '../utils/certificateCategory';

/* Monochrome Crest — printable certificate
   Black ink on white. Prata for display, EB Garamond for body.
   Print-safe: no color fills, only black/white/gray. */

const CertificateTemplate = forwardRef(function CertificateTemplate({ certificate, qrCodeUrl }, ref) {
  const { heading, preText, prominentText, postText } = getCertificateBody(certificate);

  return (
    <div
      ref={ref}
      style={{
        width: '800px',
        minHeight: '560px',
        background: '#ffffff',
        border: '10px solid #0a0a0a',
        outline: '2px solid #0a0a0a',
        outlineOffset: '-18px',
        padding: '48px 56px',
        fontFamily: "'EB Garamond', serif",
        color: '#0a0a0a',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <div style={{ fontSize: '13px', letterSpacing: '4px', color: '#666666', marginBottom: '6px', textTransform: 'uppercase' }}>
          {heading}
        </div>
        <div style={{ fontFamily: "'Prata', serif", fontSize: '30px', fontWeight: 400, color: '#0a0a0a' }}>
          {certificate.university_name || certificate.issuer_id}
        </div>
        <div style={{ width: '90px', height: '2px', background: '#0a0a0a', margin: '12px auto' }} />
      </div>

      {/* Body */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{ fontSize: '15px', color: '#444444' }}>This is to certify that</div>
        <div style={{ fontFamily: "'Prata', serif", fontSize: '38px', fontWeight: 400, color: '#0a0a0a', margin: '10px 0' }}>
          {certificate.student_name}
        </div>
        <div style={{ fontSize: '13px', color: '#666666', marginBottom: '6px' }}>Register No: {certificate.register_number}</div>
        <div style={{ fontSize: '15px', color: '#333333', lineHeight: '1.6' }}>{preText}</div>
        <div style={{ fontFamily: "'Prata', serif", fontSize: '24px', fontWeight: 400, color: '#0a0a0a', margin: '8px 0' }}>
          {prominentText}
        </div>
        {certificate.cgpa && <div style={{ fontSize: '14px', color: '#444444' }}>CGPA: {certificate.cgpa}</div>}
        {postText && <div style={{ fontSize: '14px', color: '#555555', marginTop: '6px', fontStyle: 'italic' }}>{postText}</div>}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #0a0a0a' }}>
        <div style={{ fontSize: '13px', color: '#444444', lineHeight: '1.8' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0a0a0a' }}>Certificate ID: {certificate.certificate_number}</div>
          <div><strong>Issue Date:</strong> {certificate.issue_date}</div>
          <div><strong>Status:</strong> {certificate.status}</div>
          {certificate.certificate_category && <div style={{ marginTop: '4px', color: '#666666', fontSize: '11px' }}>{certificate.certificate_category}</div>}
        </div>
        <div style={{ textAlign: 'center' }}>
          {qrCodeUrl && (
            <img src={qrCodeUrl} alt="Certificate QR Code" crossOrigin="anonymous"
              style={{ width: '200px', height: '200px', display: 'block', margin: '0 auto 6px', imageRendering: 'pixelated', background: '#ffffff', padding: '8px', border: '1px solid #0a0a0a' }} />
          )}
          <div style={{ fontSize: '11px', color: '#666666' }}>Scan to verify</div>
        </div>
      </div>
    </div>
  );
});

export default CertificateTemplate;
