import React, { forwardRef } from 'react';
import { getCertificateBody } from '../../utils/certificateCategory';

const InternshipTemplate = forwardRef(({ certificate, templatePreset, qrCodeUrl }, ref) => {
  const body = getCertificateBody(certificate);
  const certId = certificate?.id || certificate?.cert_id;
  const activeQrUrl = qrCodeUrl ||
    (certificate?.qr_code_url ? `http://localhost:5000${certificate.qr_code_url}` :
    (certId ? `http://localhost:5000/uploads/qr_${certId}.png` :
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificate?.certificate_number || certificate?.student_name || 'VERIFIED')}`));

  const containerStyle = {
    width: '850px',
    height: '580px',
    backgroundColor: '#F5F6FA',
    display: 'flex',
    fontFamily: '"Arial", sans-serif',
    overflow: 'hidden',
    border: '1px solid #d1d5db',
    boxSizing: 'border-box'
  };

  const leftPanelStyle = {
    width: '16%',
    backgroundColor: '#1C2B3A',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    padding: '24px 0',
    boxSizing: 'border-box'
  };

  const rightPanelStyle = {
    width: '84%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    padding: '24px 40px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
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
      <div style={leftPanelStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: '5px', height: '5px', background: 'rgba(255,255,255,0.5)', transform: 'rotate(45deg)' }} />
          ))}
        </div>
        
        <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: '#FFFFFF', fontSize: '1rem', letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap', flex: 1, display: 'flex', alignItems: 'center' }}>
          {certificate.university_name || 'ORGANIZATION NAME'}
        </div>
      </div>

      <div style={rightPanelStyle}>
        <div>
          <h2 style={{ fontSize: '1.75rem', color: '#1C2B3A', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
            INTERNSHIP COMPLETION CERTIFICATE
          </h2>
          
          <div style={{ width: '100%', height: '2px', backgroundColor: '#2D7D46', margin: '0 0 16px 0' }}></div>
          
          <div style={{ fontSize: '0.92rem', color: '#6b7280', margin: '0 0 8px 0' }}>
            This is to certify that
          </div>

          <div style={{ fontSize: '2.1rem', color: '#1C2B3A', fontFamily: '"Prata", serif', margin: '0 0 12px 0', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.02em' }}>
            {certificate.student_name || 'STUDENT NAME'}
          </div>

          <div style={{ fontSize: '0.92rem', maxWidth: '620px', lineHeight: '1.65', color: '#374151', marginBottom: '16px' }}>
            {formatText(body.lines) || 'Has successfully completed the internship program...'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', backgroundColor: '#f8fafc', padding: '12px 20px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Role / Department</span>
              <span style={{ fontSize: '0.9rem', color: '#1C2B3A', fontWeight: 'bold', marginTop: '2px' }}>{certificate.course || 'Intern'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Issue Date</span>
              <span style={{ fontSize: '0.9rem', color: '#1C2B3A', fontWeight: 'bold', marginTop: '2px' }}>{certificate.issue_date || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', paddingTop: '4px' }}>
          <div>
            <img
              src={activeQrUrl}
              alt="Official QR Code"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificate?.certificate_number || certificate?.student_name || 'VERIFIED')}`;
              }}
              style={{ width: '100px', height: '100px', border: '1.5px solid #1C2B3A', display: 'block', imageRendering: 'pixelated', padding: '3px', backgroundColor: '#fff' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '30px' }}>
            <div style={{ textAlign: 'center', width: '150px' }}>
              <div style={{ borderBottom: '1px solid #1C2B3A', height: '28px', marginBottom: '6px' }}></div>
              <div style={{ fontSize: '0.75rem', color: '#1C2B3A', fontWeight: 'bold' }}>HR Manager</div>
            </div>
            <div style={{ textAlign: 'center', width: '150px' }}>
              <div style={{ borderBottom: '1px solid #1C2B3A', height: '28px', marginBottom: '6px' }}></div>
              <div style={{ fontSize: '0.75rem', color: '#1C2B3A', fontWeight: 'bold' }}>Project Supervisor</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default InternshipTemplate;
