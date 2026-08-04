import React, { forwardRef } from 'react';
import { getCertificateBody } from '../../utils/certificateCategory';
import { API_BASE } from '../../config';

const ParticipationTemplate = forwardRef(({ certificate, templatePreset, qrCodeUrl }, ref) => {
  const body = getCertificateBody(certificate);
  const certId = certificate?.id || certificate?.cert_id;
  const activeQrUrl = qrCodeUrl ||
    (certificate?.qr_code_url ? `${API_BASE}${certificate.qr_code_url}` :
    (certId ? `${API_BASE}/uploads/qr_${certId}.png` :
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificate?.certificate_number || certificate?.student_name || 'VERIFIED')}`));

  // Helper to remove raw square brackets if present (e.g. "[ IT ]" -> "IT")
  const cleanStr = (str) => (str ? String(str).replace(/^\[\s*/, '').replace(/\s*\]$/, '').trim() : '');

  const rawCourse = certificate?.course || certificate?.category_detail || body.subHeading || 'Hackathon Innovation Event';
  const rawUni = certificate?.university_name || 'Organizing Committee';
  const rawDate = certificate?.issue_date || new Date().toISOString().split('T')[0];

  const eventName = cleanStr(rawCourse);
  const universityName = cleanStr(rawUni);
  const issueDate = cleanStr(rawDate);

  // General formal content matching all hackathons & technical events
  const bodyParagraphs = body.lines && body.lines.length > 0 ? body.lines : [
    `has actively participated in ${eventName}, demonstrating exceptional technical creativity,`,
    `innovative problem-solving ability, and collaborative engineering excellence in developing impactful technology solutions.`,
    `In recognition of outstanding teamwork, analytical proficiency, and competitive dedication.`,
  ];

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

  return (
    <div ref={ref} style={containerStyle}>
      {/* ── TOP DUAL-TONE BLUE BANNER ───────────────────────── */}
      <div style={{ width: '100%', height: '62px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '46px', backgroundColor: '#1A63B4' }}></div>
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '-2%',
          width: '104%',
          height: '22px',
          backgroundColor: '#0D47A1',
          transform: 'rotate(-1.2deg)',
          transformOrigin: 'left center'
        }}></div>
      </div>

      {/* ── MAIN CERTIFICATE CONTENT AREA ─────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 45px 8px 45px', zIndex: 2, textAlign: 'center' }}>
        
        {/* Certificate Heading */}
        <h1 style={{ color: '#1C539A', fontSize: '2.0rem', fontWeight: 700, margin: '0 0 4px 0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          CERTIFICATE OF PARTICIPATION
        </h1>
        <div style={{ width: '60px', height: '3px', backgroundColor: '#1C539A', margin: '0 auto 12px auto' }}></div>

        {/* Subtext */}
        <div style={{ color: '#64748b', fontSize: '0.82rem', fontFamily: 'Arial, sans-serif', marginBottom: '4px' }}>
          This certificate is proudly presented to
        </div>

        {/* Student Name */}
        <div style={{ width: '70%', borderBottom: '2px solid #1C539A', paddingBottom: '3px', margin: '0 auto 10px auto' }}>
          <div style={{ color: '#1C539A', fontSize: '2.2rem', fontWeight: 'bold', letterSpacing: '0.02em' }}>
            {certificate.student_name || 'Full Name'}
          </div>
        </div>

        {/* Event Title */}
        <div style={{ color: '#1C539A', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '8px' }}>
          {eventName}
        </div>

        {/* ── RICH GENERAL CONTENT PARAGRAPH (MATCHES ALL HACKATHONS) ── */}
        <div style={{
          maxWidth: '680px',
          color: '#334155',
          fontSize: '0.86rem',
          fontFamily: 'Arial, sans-serif',
          lineHeight: 1.55,
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          {bodyParagraphs.map((line, idx) => (
            <p key={idx} style={{ margin: '0 0 3px 0' }}>{line}</p>
          ))}
        </div>

        {/* Event Meta Line */}
        <div style={{ color: '#64748b', fontSize: '0.78rem', fontFamily: 'Arial, sans-serif', marginBottom: '10px', fontWeight: 600 }}>
          <span>{issueDate}</span> • <span>Organized by {universityName}</span>
        </div>

        {/* ── MIDDLE CENTER QR CODE ────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '2px 0 8px 0' }}>
          <img
            src={activeQrUrl}
            alt="Official QR Code"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificate?.certificate_number || certificate?.student_name || 'VERIFIED')}`;
            }}
            style={{ width: '95px', height: '95px', border: '2px solid #1C539A', display: 'block', imageRendering: 'pixelated', backgroundColor: '#FFFFFF', padding: '3px' }}
          />
        </div>

        {/* ── BOTTOM SIGNATURE / DATE ROW ───────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginTop: 'auto', padding: '0 20px 6px 20px' }}>
          <div style={{ textAlign: 'center', width: '190px' }}>
            <div style={{ borderBottom: '2px solid #94A3B8', height: '24px', marginBottom: '4px' }}></div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'Arial, sans-serif' }}>Authorized Signature</div>
          </div>

          <div style={{ textAlign: 'center', width: '190px' }}>
            <div style={{ borderBottom: '2px solid #94A3B8', height: '22px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '2px', marginBottom: '4px', color: '#1C539A', fontSize: '0.88rem', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
              {issueDate}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'Arial, sans-serif' }}>Date</div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM DUAL-TONE BLUE BANNER ──────────────────────────────── */}
      <div style={{ width: '100%', height: '48px', position: 'relative', overflow: 'hidden', marginTop: 'auto' }}>
        <div style={{
          position: 'absolute',
          top: '0',
          left: '-2%',
          width: '104%',
          height: '18px',
          backgroundColor: '#0D47A1',
          transform: 'rotate(1.2deg)',
          transformOrigin: 'left center'
        }}></div>
        <div style={{ width: '100%', height: '34px', backgroundColor: '#1A63B4', position: 'absolute', bottom: '0' }}></div>
      </div>
    </div>
  );
});

export default ParticipationTemplate;
