import React, { forwardRef } from 'react';
import { getCertificateBody } from '../../utils/certificateCategory';

const ParticipationTemplate = forwardRef(({ certificate, templatePreset, qrCodeUrl }, ref) => {
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
    padding: '0',
    boxSizing: 'border-box',
    fontFamily: '"Prata", "Cinzel", "Georgia", serif',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
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
      {/* ── TOP DUAL-TONE BLUE BANNER (NO TEXT) ───────────────────────── */}
      <div style={{ width: '100%', height: '70px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '52px', backgroundColor: '#1A63B4' }}></div>
        {/* Slanted darker ocean blue stripe */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '-2%',
          width: '104%',
          height: '24px',
          backgroundColor: '#0D47A1',
          transform: 'rotate(-1.2deg)',
          transformOrigin: 'left center'
        }}></div>
      </div>

      {/* ── MAIN CERTIFICATE CONTENT AREA ─────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 40px 10px 40px', zIndex: 2, textAlign: 'center' }}>
        
        {/* Certificate Heading */}
        <h1 style={{ color: '#1C539A', fontSize: '2.1rem', fontWeight: 700, margin: '0 0 6px 0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          CERTIFICATE OF PARTICIPATION
        </h1>
        <div style={{ width: '60px', height: '3px', backgroundColor: '#1C539A', margin: '0 auto 16px auto' }}></div>

        {/* Subtext */}
        <div style={{ color: '#64748b', fontSize: '0.85rem', fontFamily: 'Arial, sans-serif', marginBottom: '6px' }}>
          This certificate is presented to
        </div>

        {/* Student Name */}
        <div style={{ width: '70%', borderBottom: '2px solid #1C539A', paddingBottom: '4px', margin: '0 auto 14px auto' }}>
          <div style={{ color: '#1C539A', fontSize: '2.4rem', fontWeight: 'bold', letterSpacing: '0.02em' }}>
            {certificate.student_name || 'Full Name'}
          </div>
        </div>

        {/* Participation Event / Program Info */}
        <div style={{ color: '#64748b', fontSize: '0.85rem', fontFamily: 'Arial, sans-serif', marginBottom: '4px' }}>
          for successful participation in
        </div>
        
        <div style={{ color: '#1C539A', fontSize: '1.15rem', fontWeight: 'bold', marginBottom: '2px' }}>
          [ {certificate.course || body.subHeading || 'Event / Program Name'} ]
        </div>

        <div style={{ color: '#64748b', fontSize: '0.78rem', fontFamily: 'Arial, sans-serif', marginBottom: '14px' }}>
          [ {certificate.issue_date || new Date().toISOString().split('T')[0]} ] • [ {certificate.university_name || 'Location / Platform'} ]
        </div>

        {/* ── MIDDLE CENTER QR CODE (REPLACING TICK MARK) ────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '4px 0 10px 0' }}>
          <img
            src={activeQrUrl}
            alt="Official QR Code"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificate?.certificate_number || certificate?.student_name || 'VERIFIED')}`;
            }}
            style={{ width: '105px', height: '105px', border: '2px solid #1C539A', display: 'block', imageRendering: 'pixelated', backgroundColor: '#FFFFFF', padding: '4px' }}
          />
        </div>

        {/* ── BOTTOM SIGNATURE / DATE ROW ───────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginTop: 'auto', padding: '0 20px 10px 20px' }}>
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ borderBottom: '2px solid #94A3B8', height: '30px', marginBottom: '6px' }}></div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'Arial, sans-serif' }}>Authorized Signature</div>
          </div>

          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ borderBottom: '2px solid #94A3B8', height: '26px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '3px', marginBottom: '6px', color: '#1C539A', fontSize: '0.9rem', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
              {certificate.issue_date || new Date().toISOString().split('T')[0]}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'Arial, sans-serif' }}>Date</div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM DUAL-TONE BLUE BANNER ──────────────────────────────── */}
      <div style={{ width: '100%', height: '55px', position: 'relative', overflow: 'hidden', marginTop: 'auto' }}>
        {/* Slanted darker ocean blue stripe */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '-2%',
          width: '104%',
          height: '22px',
          backgroundColor: '#0D47A1',
          transform: 'rotate(1.2deg)',
          transformOrigin: 'left center'
        }}></div>
        <div style={{ width: '100%', height: '40px', backgroundColor: '#1A63B4', position: 'absolute', bottom: '0' }}></div>
      </div>
    </div>
  );
});

export default ParticipationTemplate;
