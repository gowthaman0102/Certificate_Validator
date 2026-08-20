import React, { forwardRef } from 'react';
import { getCertificateBody } from '../../skill-passport-wallet/utils/certificateCategory';
import { useQrDataUrl } from '../../../app/useQrDataUrl';

const ProjectTemplate = forwardRef(({ certificate, templatePreset, qrCodeUrl }, ref) => {
  const body = getCertificateBody(certificate);
  const activeQrUrl = useQrDataUrl(certificate, qrCodeUrl);

  const containerStyle = {
    width: '850px',
    height: '580px',
    backgroundColor: '#FDFBF7',
    border: '6px solid #1E1B4B',
    padding: '8px',
    boxSizing: 'border-box',
    fontFamily: '"Prata", serif',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const innerBorderStyle = {
    width: '100%',
    height: '100%',
    border: '1px solid #B8962E',
    boxSizing: 'border-box',
    padding: '16px 24px',
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
      <div style={innerBorderStyle}>
        
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.85rem', color: '#1E1B4B', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold' }}>
            PROJECT COMPLETION CERTIFICATE
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <span style={{ color: '#B8962E', fontSize: '10px', margin: '0 10px' }}>◆</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#B8962E' }}></div>
            <span style={{ color: '#B8962E', fontSize: '10px', margin: '0 10px' }}>◆</span>
          </div>
        </div>

        {/* Center Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '0.95rem', fontStyle: 'italic', color: '#64748b', margin: '6px 0 4px 0' }}>
            This is to certify that
          </div>

          <div style={{ fontSize: '2.2rem', color: '#1E1B4B', fontWeight: 'bold', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {certificate.student_name || 'STUDENT NAME'}
          </div>

          {body.subHeading && (
            <div style={{ fontSize: '1.05rem', fontStyle: 'italic', color: '#B8962E', margin: '0 0 8px 0', textAlign: 'center' }}>
              {body.subHeading}
            </div>
          )}

          <div style={{ fontSize: '0.88rem', textAlign: 'center', maxWidth: '680px', lineHeight: '1.6', fontFamily: 'Arial, sans-serif', color: '#334155' }}>
            {formatText(body.lines) || 'Has successfully completed the project work...'}
          </div>
        </div>

        {/* Academic Details Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '12px', backgroundColor: 'rgba(30,27,75,0.03)', borderTop: '1px solid rgba(184,150,46,0.3)', borderBottom: '1px solid rgba(184,150,46,0.3)', padding: '10px 18px', margin: '8px 0' }}>
          <div>
            <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 'bold' }}>Project Title</div>
            <div style={{ fontSize: '0.85rem', color: '#1E1B4B', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>{certificate.certificate_detail || certificate.course || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 'bold' }}>Project Period</div>
            <div style={{ fontSize: '0.85rem', color: '#1E1B4B', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>{certificate.start_year ? `${certificate.start_year} – ${certificate.end_year || ''}` : (certificate.end_year || 'N/A')}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 'bold' }}>Issue Date</div>
            <div style={{ fontSize: '0.85rem', color: '#1E1B4B', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>{certificate.issue_date || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 'bold' }}>CGPA / Grade</div>
            <div style={{ fontSize: '0.85rem', color: '#1E1B4B', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>{certificate.cgpa || 'N/A'}</div>
          </div>
        </div>

        {/* Bottom Row: QR Code (Inside Frame) + Dual Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={activeQrUrl}
              alt="Official QR Code"
              style={{ width: '100px', height: '100px', border: '2px solid #1E1B4B', display: 'block', imageRendering: 'pixelated', padding: '3px', backgroundColor: '#fff' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '30px' }}>
            <div style={{ textAlign: 'center', width: '150px' }}>
              <div style={{ borderBottom: '1px solid #1E1B4B', height: '30px', marginBottom: '6px' }}></div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#1E1B4B', fontWeight: 'bold' }}>Project Guide</div>
            </div>
            <div style={{ textAlign: 'center', width: '150px' }}>
              <div style={{ borderBottom: '1px solid #1E1B4B', height: '30px', marginBottom: '6px' }}></div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#1E1B4B', fontWeight: 'bold' }}>Head of Department</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

export default ProjectTemplate;
