import React, { forwardRef } from 'react';
import { getCertificateBody } from '../../skill-passport-wallet/utils/certificateCategory';
import { useQrDataUrl } from '../../../app/useQrDataUrl';

const GraduationTemplate = forwardRef(({ certificate, templatePreset, qrCodeUrl }, ref) => {
  const body = getCertificateBody(certificate);
  const activeQrUrl = useQrDataUrl(certificate, qrCodeUrl);

  const containerStyle = {
    width: '620px',
    height: '880px',
    backgroundColor: '#FDFBF7',
    padding: '24px',
    boxSizing: 'border-box',
    fontFamily: '"Prata", "Georgia", "Times New Roman", serif',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const innerFrameStyle = {
    width: '100%',
    height: '100%',
    border: '1.5px solid #555555',
    boxSizing: 'border-box',
    padding: '24px 30px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative'
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

  const univInitial = (certificate.university_name || 'K')[0].toUpperCase();

  return (
    <div ref={ref} style={containerStyle}>
      <div style={innerFrameStyle}>
        
        {/* ── TOP INSTITUTION HEADER ───────────────────────────────────── */}
        <div style={{ width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '0.82rem', color: '#333333', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 'bold' }}>
            {certificate.university_name || 'KINGSMERE UNIVERSITY'}
          </div>
          <div style={{ fontSize: '0.62rem', color: '#777777', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '3px' }}>
            FOUNDED 1849 · OFFICE OF THE REGISTRAR
          </div>
        </div>

        {/* ── CENTER CIRCULAR EMBLEM ────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
          <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="44" stroke="#555555" strokeWidth="1.2" />
            <circle cx="50" cy="50" r="34" stroke="#777777" strokeWidth="1" strokeDasharray="3 2" />
            <text x="50" y="58" fontSize="26" fontFamily="Georgia, serif" fill="#222222" textAnchor="middle">{univInitial}</text>
          </svg>
        </div>

        {/* ── CERTIFICATE TITLE ─────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h1 style={{ color: '#222222', fontSize: '2.1rem', fontWeight: 400, margin: '0 0 4px 0', fontFamily: 'Georgia, serif' }}>
            Certificate of Graduation
          </h1>
          <div style={{ width: '50px', height: '1.5px', backgroundColor: '#555555', margin: '0 auto 10px auto' }}></div>
          
          <div style={{ color: '#555555', fontSize: '0.88rem', fontStyle: 'italic' }}>
            Know all persons by these presents that
          </div>
        </div>

        {/* ── RECIPIENT NAME WITH UNDERLINE ─────────────────────────────── */}
        <div style={{ width: '100%', textAlign: 'center' }}>
          <div style={{ width: '70%', borderBottom: '1px solid #777777', paddingBottom: '4px', margin: '0 auto' }}>
            <div style={{ color: '#111111', fontSize: '2.35rem', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
              {certificate.student_name || 'Full Name'}
            </div>
          </div>
        </div>

        {/* ── CONFERRAL BODY CONTENT ────────────────────────────────────── */}
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '480px' }}>
          <div style={{ color: '#444444', fontSize: '0.85rem', lineHeight: '1.6', fontFamily: 'Georgia, serif', marginBottom: '10px' }}>
            {formatText(body.lines) || 'has completed the course of study prescribed by the Faculty and is admitted to the degree of'}
          </div>

          <div style={{ color: '#222222', fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'Georgia, serif', marginBottom: '4px' }}>
            [ {certificate.course || 'Degree / Programme Title'} ]
          </div>

          <div style={{ color: '#666666', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '10px' }}>
            [ {certificate.certificate_detail || 'Faculty Name • Honours / Class'} ]
          </div>

          <div style={{ color: '#555555', fontSize: '0.82rem', fontFamily: 'Georgia, serif', marginTop: '6px' }}>
            Academic Period: {certificate.start_year ? `${certificate.start_year} – ${certificate.end_year || ''}` : (certificate.end_year || 'N/A')} · Issue Date: {certificate.issue_date || 'N/A'}
          </div>
          <div style={{ color: '#555555', fontSize: '0.82rem', fontFamily: 'Georgia, serif', marginTop: '3px' }}>
            Done at {certificate.university_name || 'Kingsmere'}
          </div>
        </div>

        {/* ── DUAL SIGNATURE ROW: HOD & CHAIRMAN ───────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 10px' }}>
          <div style={{ textAlign: 'center', width: '180px' }}>
            <div style={{ borderBottom: '1px solid #777777', height: '32px', marginBottom: '6px' }}></div>
            <div style={{ color: '#444444', fontSize: '0.78rem', fontFamily: 'Georgia, serif' }}>HOD</div>
          </div>

          <div style={{ textAlign: 'center', width: '180px' }}>
            <div style={{ borderBottom: '1px solid #777777', height: '32px', marginBottom: '6px' }}></div>
            <div style={{ color: '#444444', fontSize: '0.78rem', fontFamily: 'Georgia, serif' }}>Chairman</div>
          </div>
        </div>

        {/* ── BOTTOM CENTER: OFFICIAL QR CODE ────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px' }}>
          <img
            src={activeQrUrl}
            alt="Official QR Code"
            style={{ width: '95px', height: '95px', border: '1px solid #555555', display: 'block', imageRendering: 'pixelated', backgroundColor: '#FFFFFF', padding: '3px' }}
          />
        </div>

      </div>
    </div>
  );
});

export default GraduationTemplate;
