import React, { forwardRef } from 'react';
import { getCertificateBody } from '../../skill-passport-wallet/utils/certificateCategory';
import { useQrDataUrl } from '../../../app/useQrDataUrl';

const CourseCompletionTemplate = forwardRef(({ certificate, templatePreset, qrCodeUrl }, ref) => {
  const body = getCertificateBody(certificate);
  const activeQrUrl = useQrDataUrl(certificate, qrCodeUrl);

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
    width: '18%',
    backgroundColor: '#0A4D68',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    padding: '24px 0',
    boxSizing: 'border-box'
  };

  const rightPanelStyle = {
    width: '82%',
    height: '100%',
    backgroundColor: '#FFFFFF',
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <div style={{ width: '6px', height: '6px', background: 'rgba(255,255,255,0.7)', transform: 'rotate(45deg)' }} />
          <div style={{ width: '4px', height: '4px', background: 'rgba(255,255,255,0.45)', transform: 'rotate(45deg)' }} />
          <div style={{ width: '6px', height: '6px', background: 'rgba(255,255,255,0.7)', transform: 'rotate(45deg)' }} />
        </div>
        
        <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: '#FFFFFF', fontSize: '1.05rem', letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap', flex: 1, display: 'flex', alignItems: 'center' }}>
          {certificate.university_name || 'UNIVERSITY NAME'}
        </div>
      </div>

      <div style={rightPanelStyle}>
        <div style={{ width: '100%', backgroundColor: '#0A4D68', color: '#FFFFFF', padding: '14px 32px', fontSize: '1.15rem', fontWeight: 'bold', letterSpacing: '0.1em', boxSizing: 'border-box' }}>
          CERTIFICATE OF COURSE COMPLETION
        </div>

        <div style={{ padding: '20px 32px 24px 32px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '0.92rem', fontStyle: 'italic', color: '#64748b', margin: '0 0 8px 0' }}>
              This is to certify that
            </div>

            <div style={{ fontSize: '2.1rem', color: '#0A4D68', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              {certificate.student_name || 'STUDENT NAME'}
            </div>

            <div style={{ fontSize: '0.88rem', textAlign: 'center', maxWidth: '580px', lineHeight: '1.6', fontFamily: 'Arial, sans-serif', color: '#334155', marginBottom: '14px' }}>
              {formatText(body.lines) || 'Has successfully completed the prescribed coursework and satisfied all requirements...'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px', width: '90%', backgroundColor: '#f8fafc', padding: '12px 18px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 'bold' }}>Course Completed</div>
                <div style={{ fontSize: '0.85rem', color: '#0A4D68', fontWeight: 'bold' }}>{certificate.certificate_detail || certificate.course || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 'bold' }}>Course Period</div>
                <div style={{ fontSize: '0.85rem', color: '#0A4D68', fontWeight: 'bold' }}>{certificate.start_year ? `${certificate.start_year} – ${certificate.end_year || ''}` : (certificate.end_year || 'N/A')}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 'bold' }}>Issue Date</div>
                <div style={{ fontSize: '0.85rem', color: '#0A4D68', fontWeight: 'bold' }}>{certificate.issue_date || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', paddingTop: '10px' }}>
            <div>
              <img
                src={activeQrUrl}
                alt="Official QR Code"
                style={{ width: '100px', height: '100px', border: '2px solid #0A4D68', display: 'block', imageRendering: 'pixelated', padding: '3px', backgroundColor: '#fff' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '30px' }}>
              <div style={{ textAlign: 'center', width: '150px' }}>
                <div style={{ borderBottom: '1px solid #0A4D68', height: '28px', marginBottom: '6px' }}></div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#0A4D68', fontWeight: 'bold' }}>Course Instructor</div>
              </div>
              <div style={{ textAlign: 'center', width: '150px' }}>
                <div style={{ borderBottom: '1px solid #0A4D68', height: '28px', marginBottom: '6px' }}></div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#0A4D68', fontWeight: 'bold' }}>Director of Education</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CourseCompletionTemplate;
