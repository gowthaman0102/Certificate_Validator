import React, { forwardRef } from 'react';
import { getCertificateBody } from '../../skill-passport-wallet/utils/certificateCategory';
import { API_BASE } from '../../../app/config';

const AcademicExcellenceTemplate = forwardRef(({ certificate, templatePreset, qrCodeUrl }, ref) => {
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
    display: 'flex',
    fontFamily: '"Prata", serif',
    overflow: 'hidden',
    border: '1px solid #cbd5e1',
    boxSizing: 'border-box'
  };

  const leftPanelStyle = {
    width: '28%',
    backgroundColor: '#0B3D2E',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: '20px',
    boxSizing: 'border-box'
  };

  const rightPanelStyle = {
    width: '72%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    padding: '24px 32px',
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
        <div style={{ position: 'absolute', top: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '32px', height: '2px', background: 'rgba(255,255,255,0.7)' }} />
          <div style={{ width: '20px', height: '2px', background: 'rgba(255,255,255,0.45)' }} />
          <div style={{ width: '32px', height: '2px', background: 'rgba(255,255,255,0.7)' }} />
        </div>

        <div style={{ transform: 'rotate(-90deg)', color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.3em', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
          ACADEMIC EXCELLENCE
        </div>

        <div style={{ position: 'absolute', bottom: '30px', color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 'bold', letterSpacing: '0.1em' }}>
          {certificate.graduation_year || new Date().getFullYear()}
        </div>
      </div>

      <div style={rightPanelStyle}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>
            CERTIFICATE OF
          </div>
          <h2 style={{ fontSize: '2.1rem', color: '#0B3D2E', fontWeight: 'bold', margin: '0 0 10px 0' }}>
            Academic Excellence
          </h2>
          
          <div style={{ width: '100%', height: '1px', backgroundColor: '#0B3D2E', opacity: 0.3, margin: '0 0 12px 0' }}></div>
          
          <div style={{ fontSize: '0.92rem', fontStyle: 'italic', color: '#64748b', margin: '0 0 8px 0' }}>
            Presented with highest honours to
          </div>

          <div style={{ fontSize: '2.1rem', color: '#0B3D2E', fontWeight: 'bold', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            {certificate.student_name || 'STUDENT NAME'}
          </div>

          <div style={{ fontSize: '0.88rem', maxWidth: '520px', lineHeight: '1.6', fontFamily: 'Arial, sans-serif', color: '#64748b', marginBottom: '14px' }}>
            {formatText(body.lines) || 'For demonstrating exceptional academic prowess and achieving the highest standards of excellence...'}
          </div>
        </div>

        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr 1fr', gap: '12px', marginBottom: '14px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '8px 0' }}>
            <div>
              <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 'bold' }}>Course</div>
              <div style={{ fontSize: '0.85rem', color: '#0B3D2E', fontWeight: 'bold' }}>{certificate.course || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 'bold' }}>CGPA</div>
              <div style={{ fontSize: '0.85rem', color: '#0B3D2E', fontWeight: 'bold' }}>{certificate.cgpa || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 'bold' }}>Academic Period</div>
              <div style={{ fontSize: '0.85rem', color: '#0B3D2E', fontWeight: 'bold' }}>{certificate.start_year ? `${certificate.start_year} – ${certificate.end_year || ''}` : (certificate.end_year || 'N/A')}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 'bold' }}>Issue Date</div>
              <div style={{ fontSize: '0.85rem', color: '#0B3D2E', fontWeight: 'bold' }}>{certificate.issue_date || 'N/A'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <img
                src={activeQrUrl}
                alt="Official QR Code"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificate?.certificate_number || certificate?.student_name || 'VERIFIED')}`;
                }}
                style={{ width: '100px', height: '100px', border: '2px solid #0B3D2E', display: 'block', imageRendering: 'pixelated', padding: '3px', backgroundColor: '#fff' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '30px' }}>
              <div style={{ textAlign: 'center', width: '140px' }}>
                <div style={{ borderBottom: '2px solid #0B3D2E', height: '28px', marginBottom: '6px' }}></div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#0B3D2E', fontWeight: 'bold' }}>Program Director</div>
              </div>
              <div style={{ textAlign: 'center', width: '140px' }}>
                <div style={{ borderBottom: '2px solid #0B3D2E', height: '28px', marginBottom: '6px' }}></div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#0B3D2E', fontWeight: 'bold' }}>Dean of Academics</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AcademicExcellenceTemplate;
