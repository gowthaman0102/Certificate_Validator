import React, { forwardRef } from 'react';
import { getCertificateBody } from '../../utils/certificateCategory';
import { API_BASE } from '../../config';

const BonafideTemplate = forwardRef(({ certificate, templatePreset, qrCodeUrl }, ref) => {
  const body = getCertificateBody(certificate);
  const certId = certificate?.id || certificate?.cert_id;
  const activeQrUrl = qrCodeUrl ||
    (certificate?.qr_code_url ? `${API_BASE}${certificate.qr_code_url}` :
    (certId ? `${API_BASE}/uploads/qr_${certId}.png` :
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificate?.certificate_number || certificate?.student_name || 'VERIFIED')}`));

  const containerStyle = {
    width: '850px',
    height: '580px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #000',
    padding: '8px',
    boxSizing: 'border-box',
    fontFamily: '"Times New Roman", Times, serif',
    position: 'relative',
    overflow: 'hidden'
  };

  const innerBorderStyle = {
    width: '100%',
    height: '100%',
    border: '1px solid #000',
    boxSizing: 'border-box',
    padding: '20px 28px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center'
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

  const refNo = `BN/${new Date().getFullYear()}/${(certificate.register_number || '').slice(-4) || '0001'}`;

  return (
    <div ref={ref} style={containerStyle}>
      <div style={innerBorderStyle}>
        {/* Institution header */}
        <div style={{ width: '100%', textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.06em', color: '#000', textTransform: 'uppercase' }}>
            {certificate.university_name || 'INSTITUTION NAME'}
          </div>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.18em', color: '#444', marginTop: '3px', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif' }}>
            Office of the Registrar · Official Document
          </div>
        </div>

        {/* Certificate Title */}
        <div style={{ width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.9rem', margin: '4px 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 'bold' }}>
            BONAFIDE CERTIFICATE
          </h1>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#333' }}>
            <div>Ref No: {refNo}</div>
            <div>Date: {certificate.issue_date || new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div style={{ fontSize: '0.88rem', fontWeight: 'bold', textDecoration: 'underline', alignSelf: 'center', letterSpacing: '0.05em' }}>
          TO WHOM IT MAY CONCERN
        </div>

        <div style={{ fontSize: '1.05rem', lineHeight: '1.7', textAlign: 'justify', width: '100%', color: '#111' }}>
          {formatText(body.lines) || `This is to certify that ${certificate.student_name || 'STUDENT NAME'} is a bonafide student of this institution...`}
        </div>

        {/* Bottom Row: QR + Issued By + Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', paddingTop: '4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={activeQrUrl}
              alt="Official QR Code"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificate?.certificate_number || certificate?.student_name || 'VERIFIED')}`;
              }}
              style={{ width: '100px', height: '100px', border: '2px solid #000', display: 'block', imageRendering: 'pixelated', padding: '3px', backgroundColor: '#fff' }}
            />
          </div>

          <div style={{ textAlign: 'center', padding: '6px 16px', border: '1px solid #000' }}>
            <div style={{ fontSize: '0.58rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'Arial, sans-serif' }}>Issued by</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#000', marginTop: '2px', maxWidth: '160px' }}>{certificate.university_name || 'Issuing Institution'}</div>
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ textAlign: 'center', width: '120px' }}>
              <div style={{ borderBottom: '1px solid #000', height: '26px', marginBottom: '6px' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>Class Advisor</div>
            </div>
            <div style={{ textAlign: 'center', width: '120px' }}>
              <div style={{ borderBottom: '1px solid #000', height: '26px', marginBottom: '6px' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>Principal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default BonafideTemplate;
