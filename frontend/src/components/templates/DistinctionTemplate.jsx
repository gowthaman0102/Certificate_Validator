import React, { forwardRef } from 'react';
import { getCertificateBody } from '../../utils/certificateCategory';
import { API_BASE } from '../../config';

const DistinctionTemplate = forwardRef(({ certificate, templatePreset, qrCodeUrl }, ref) => {
  const body = getCertificateBody(certificate);
  const certId = certificate?.id || certificate?.cert_id;
  const activeQrUrl = qrCodeUrl ||
    (certificate?.qr_code_url ? `${API_BASE}${certificate.qr_code_url}` :
    (certId ? `${API_BASE}/uploads/qr_${certId}.png` :
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificate?.certificate_number || certificate?.student_name || 'VERIFIED')}`));

  const containerStyle = {
    width: '850px',
    height: '580px',
    backgroundColor: '#0D1B3E',
    backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 8px)',
    border: '3px solid #C9A227',
    padding: '24px 44px',
    boxSizing: 'border-box',
    fontFamily: '"Prata", serif',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: '#EDE8D5',
    overflow: 'hidden'
  };

  const innerBorderStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    outline: '2px solid rgba(201,162,39,0.4)',
    outlineOffset: '-18px',
    pointerEvents: 'none'
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
      <div style={innerBorderStyle}></div>
      
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
        <div style={{ fontSize: '1rem', color: '#fff', textTransform: 'uppercase', fontWeight: 'bold' }}>
          {certificate.university_name || 'UNIVERSITY NAME'}
        </div>
        <div style={{ backgroundColor: '#C9A227', color: '#0D1B3E', padding: '5px 14px', borderRadius: '16px', fontSize: '0.72rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          DISTINCTION CERTIFICATE
        </div>
      </div>

      {/* Center Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0', width: '50%' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(201,162,39,0.5)' }} />
          <div style={{ color: '#C9A227', fontSize: '1rem', letterSpacing: '4px' }}>✦ ✦ ✦</div>
          <div style={{ flex: 1, height: '1px', background: 'rgba(201,162,39,0.5)' }} />
        </div>

        <h2 style={{ fontSize: '2.1rem', color: '#C9A227', margin: '0 0 8px 0', textTransform: 'capitalize', fontWeight: 'bold' }}>
          Distinction Certificate
        </h2>
        
        <div style={{ width: '90px', height: '2px', backgroundColor: '#C9A227', margin: '0 0 10px 0' }}></div>
        
        <div style={{ fontSize: '1.05rem', fontStyle: 'italic', margin: '0 0 10px 0', color: '#EDE8D5' }}>
          {certificate.course || 'Course Name'}
        </div>

        <div style={{ fontSize: '0.88rem', fontStyle: 'italic', margin: '0 0 4px 0' }}>
          Awarded with Highest Distinction to
        </div>

        <div style={{ fontSize: '2.1rem', color: '#C9A227', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          {certificate.student_name || 'STUDENT NAME'}
        </div>

        <div style={{ fontSize: '0.88rem', textAlign: 'center', maxWidth: '650px', lineHeight: '1.6', fontFamily: 'Arial, sans-serif' }}>
          {formatText(body.lines) || 'In recognition of outstanding academic performance and excellence...'}
        </div>
      </div>

      {/* Footer Row: QR Code + Stars + Signatures */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1 }}>
        <div>
          <img
            src={activeQrUrl}
            alt="Official QR Code"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificate?.certificate_number || certificate?.student_name || 'VERIFIED')}`;
            }}
            style={{ width: '95px', height: '95px', border: '2px solid #C9A227', display: 'block', imageRendering: 'pixelated', padding: '3px', backgroundColor: '#fff' }}
          />
        </div>

        <div style={{ color: '#C9A227', fontSize: '1.2rem', letterSpacing: '8px' }}>
          ★ ★ ★
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ textAlign: 'center', width: '110px' }}>
            <div style={{ borderBottom: '1px solid #EDE8D5', height: '28px', marginBottom: '6px' }}></div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>HOD</div>
          </div>
          <div style={{ textAlign: 'center', width: '110px' }}>
            <div style={{ borderBottom: '1px solid #EDE8D5', height: '28px', marginBottom: '6px' }}></div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Principal</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DistinctionTemplate;
