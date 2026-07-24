import { forwardRef } from 'react';

/**
 * High-Resolution, Print-Friendly Colorful Category Certificate Template Component
 */
const CategoryCertificateTemplate = forwardRef(({ certificate, templatePreset, qrCodeUrl }, ref) => {
  if (!certificate) return null;

  // Preset fallback if none provided
  const preset = templatePreset || {
    primary_color: '#0A2540',
    secondary_color: '#D4AF37',
    accent_color: '#1A365D',
    bg_gradient: 'linear-gradient(135deg, #FAFBFD 0%, #EFF4F9 100%)',
    watermark_text: 'OFFICIAL CERTIFICATE',
    badge_title: certificate.certificate_category || 'ACADEMIC CREDENTIAL',
  };

  const primary = preset.primary_color || '#0A2540';
  const secondary = preset.secondary_color || '#D4AF37';
  const bgGrad = preset.bg_gradient || 'linear-gradient(135deg, #FAFBFD 0%, #EFF4F9 100%)';
  const watermark = preset.watermark_text || 'OFFICIAL CERTIFICATE';
  const badgeTitle = preset.badge_title || certificate.certificate_category || 'VERIFIED CERTIFICATE';

  const categoryName = certificate.certificate_category || 'Course Completion Certificate';
  const detailText = certificate.certificate_detail || '';

  return (
    <div
      ref={ref}
      style={{
        width: '850px',
        minHeight: '600px',
        padding: '2.5rem',
        background: bgGrad,
        border: `8px double ${secondary}`,
        borderRadius: '8px',
        boxShadow: `0 8px 30px rgba(0,0,0,0.12), inset 0 0 0 3px ${primary}`,
        position: 'relative',
        fontFamily: "'Inter', sans-serif",
        color: '#1e293b',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >

      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: `2px solid ${secondary}`, paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '55px', height: '55px', borderRadius: '50%', background: primary, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, border: `2px solid ${secondary}` }}>
            🏛
          </div>
          <div>
            <h2 style={{ margin: 0, fontFamily: "'Prata', serif", color: primary, fontSize: '1.5rem', fontWeight: 700 }}>
              {certificate.university_name || 'VERIFIED UNIVERSITY'}
            </h2>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>OFFICIAL ACADEMIC CREDENTIAL</div>
          </div>
        </div>

        {/* Category Badge */}
        <div style={{ background: primary, color: secondary, padding: '0.4rem 1rem', borderRadius: '25px', border: `1.5px solid ${secondary}`, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {badgeTitle}
        </div>
      </div>

      {/* Main Certificate Title */}
      <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
        <h1 style={{ fontFamily: "'Prata', serif", fontSize: '2.2rem', color: primary, margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {categoryName}
        </h1>
        {detailText && <div style={{ fontSize: '1rem', color: primary, fontStyle: 'italic', marginTop: '0.2rem' }}>({detailText})</div>}
        <div style={{ width: '120px', height: '3px', background: secondary, margin: '0.8rem auto 0 auto', borderRadius: '2px' }} />
      </div>

      {/* Recipient Statement */}
      <div style={{ textAlign: 'center', margin: '1.25rem 0', fontSize: '0.95rem', color: '#475569' }}>
        This is to certify that
        <div style={{ fontFamily: "'Prata', serif", fontSize: '2.1rem', fontWeight: 700, color: primary, margin: '0.5rem 0', textDecoration: `underline decoration-color: ${secondary}` }}>
          {certificate.student_name}
        </div>
        Reg. No: <strong style={{ color: primary, fontFamily: 'monospace', fontSize: '1.05rem' }}>{certificate.register_number}</strong> has successfully completed the program
      </div>

      {/* Course & Academic Details Card */}
      <div style={{ background: '#ffffff', border: `1.5px solid ${primary}`, borderRadius: '12px', padding: '1rem 1.5rem', margin: '1rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.8rem', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>COURSE / DEPARTMENT</span>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: primary }}>{certificate.course}</div>
        </div>
        {certificate.cgpa && (
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>CGPA / GRADE</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: primary }}>{certificate.cgpa}</div>
          </div>
        )}
        <div>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>ACADEMIC DURATION</span>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: primary }}>{certificate.start_year ? `${certificate.start_year} - ` : ''}{certificate.end_year}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>ISSUE DATE</span>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: primary }}>{certificate.issue_date}</div>
        </div>
      </div>

      {/* Bottom Footer Row: QR + Signature + Blockchain Notice */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: `1.5px solid ${secondary}` }}>
        {/* QR Code */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="QR Verification"
              crossOrigin="anonymous"
              style={{
                width: '150px',
                height: '150px',
                border: `2px solid ${primary}`,
                borderRadius: '8px',
                background: '#ffffff',
                padding: '8px',
                imageRendering: 'pixelated',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                display: 'block',
              }}
            />
          ) : (
            <div style={{ width: '150px', height: '150px', border: `2px solid ${primary}`, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>QR CODE</div>
          )}
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            <strong style={{ color: primary, display: 'block', fontSize: '0.85rem', marginBottom: '2px' }}>SCAN TO VERIFY</strong>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>RSA-2048 Digital Signature</span>
          </div>
        </div>



        {/* Signature & Seal */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Prata', serif", fontSize: '1.1rem', fontWeight: 700, color: primary, borderBottom: `1px solid ${primary}`, paddingBottom: '2px', display: 'inline-block' }}>
            Registrar / Authorized Signatory
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{certificate.university_name || 'Issuing Authority'}</div>
        </div>
      </div>
    </div>
  );
});

export default CategoryCertificateTemplate;
