import React, { forwardRef } from 'react';
import { getCertificateBody } from '../../utils/certificateCategory';

const MeritTemplate = forwardRef(({ certificate, templatePreset, qrCodeUrl }, ref) => {
  const body = getCertificateBody(certificate);
  const certId = certificate?.id || certificate?.cert_id;
  const activeQrUrl = qrCodeUrl ||
    (certificate?.qr_code_url ? `http://localhost:5000${certificate.qr_code_url}` :
    (certId ? `http://localhost:5000/uploads/qr_${certId}.png` :
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificate?.certificate_number || certificate?.student_name || 'VERIFIED')}`));

  const containerStyle = {
    width: '850px',
    height: '580px',
    backgroundColor: '#FFFFFF',
    border: '8px solid #0D2149',
    boxShadow: 'inset 0 0 0 4px #B8962E, inset 0 0 0 14px #0D2149',
    padding: '22px 32px',
    boxSizing: 'border-box',
    fontFamily: '"Prata", serif',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: '#334155',
    overflow: 'hidden'
  };

  const formatText = (text) => {
    if (!text) return null;
    const lines = Array.isArray(text) ? text : String(text).split('\n');
    return lines.map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <div ref={ref} style={containerStyle}>
      {/* Top Bar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: '#0D2149', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>
          {certificate.university_name || 'UNIVERSITY NAME'}
        </div>
        <div style={{ backgroundColor: '#0D2149', color: '#FFFFFF', padding: '5px 14px', borderRadius: '16px', fontSize: '0.72rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          MERIT CERTIFICATE
        </div>
      </div>

      {/* Center Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Merit Award Stars */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '80px', height: '1.5px', background: 'linear-gradient(to right, transparent, #B8962E)' }} />
            <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
              <polygon points="15,2 18.5,11 28,11 20.5,17 23.5,26 15,20 6.5,26 9.5,17 2,11 11.5,11" fill="#0D2149" />
            </svg>
            <div style={{ width: '80px', height: '1.5px', background: 'linear-gradient(to left, transparent, #B8962E)' }} />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <svg width="15" height="15" viewBox="0 0 30 30" fill="none"><polygon points="15,2 18.5,11 28,11 20.5,17 23.5,26 15,20 6.5,26 9.5,17 2,11 11.5,11" fill="#B8962E" opacity="0.85"/></svg>
            <svg width="15" height="15" viewBox="0 0 30 30" fill="none"><polygon points="15,2 18.5,11 28,11 20.5,17 23.5,26 15,20 6.5,26 9.5,17 2,11 11.5,11" fill="#B8962E" opacity="0.85"/></svg>
          </div>
        </div>

        <h2 style={{ fontSize: '2.1rem', color: '#0D2149', margin: '0 0 8px 0', textTransform: 'capitalize', fontWeight: 'bold' }}>
          Certificate of Merit
        </h2>
        
        <div style={{ width: '100%', height: '1px', backgroundColor: '#B8962E', margin: '0 0 10px 0' }}></div>
        
        <div style={{ fontSize: '0.95rem', fontStyle: 'italic', color: '#64748b', margin: '0 0 4px 0' }}>
          This is to certify that
        </div>

        <div style={{ fontSize: '2.1rem', color: '#0D2149', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          {certificate.student_name || 'STUDENT NAME'}
        </div>

        <div style={{ fontSize: '0.88rem', textAlign: 'center', maxWidth: '680px', lineHeight: '1.6', fontFamily: 'Arial, sans-serif', color: '#334155' }}>
          {formatText(body.lines) || 'Has been awarded this certificate of merit for exceptional academic performance...'}
        </div>
      </div>

      <div>
        <div style={{ width: '100%', height: '1px', backgroundColor: '#B8962E', margin: '0 0 10px 0' }}></div>

        {/* Bottom Row: QR Code + Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <img
              src={activeQrUrl}
              alt="Official QR Code"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificate?.certificate_number || certificate?.student_name || 'VERIFIED')}`;
              }}
              style={{ width: '100px', height: '100px', border: '2px solid #0D2149', display: 'block', imageRendering: 'pixelated', padding: '3px', backgroundColor: '#fff' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ textAlign: 'center', width: '120px' }}>
              <div style={{ borderBottom: '1px solid #0D2149', height: '28px', marginBottom: '6px' }}></div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#0D2149', fontWeight: 'bold' }}>HOD</div>
            </div>
            <div style={{ textAlign: 'center', width: '120px' }}>
              <div style={{ borderBottom: '1px solid #0D2149', height: '28px', marginBottom: '6px' }}></div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#0D2149', fontWeight: 'bold' }}>Principal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MeritTemplate;
