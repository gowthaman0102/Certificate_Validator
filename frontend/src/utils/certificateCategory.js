/**
 * certificateCategory.js
 *
 * Single source of truth for all certificate category logic.
 * Imported by CertificateTemplate, UniversityDashboard, Verifier,
 * StudentAnalytics, and WalletDashboard — never duplicated.
 *
 * No React dependency — pure JS so it can be tested in isolation.
 */

// ─── Master category list ─────────────────────────────────────────────────────

export const CATEGORIES = [
  { value: 'Degree / Graduation Certificate',    label: '🎓 Degree / Graduation Certificate' },
  { value: 'Course Completion Certificate',       label: '📖 Course Completion Certificate' },
  { value: 'Merit Certificate',                  label: '🏅 Merit Certificate' },
  { value: 'Distinction Certificate',             label: '⭐ Distinction Certificate' },
  { value: 'Internship Completion Certificate',   label: '💼 Internship Completion Certificate' },
  { value: 'Project Completion Certificate',      label: '🔬 Project Completion Certificate' },
  { value: 'Participation Certificate',           label: '🤝 Participation Certificate' },
  { value: 'Academic Excellence Certificate',     label: '🏆 Academic Excellence Certificate' },
  { value: 'Bonafide Certificate',                label: '📚 Bonafide Certificate' },
];

// ─── Categories that require the "Certificate Detail" field ───────────────────

export const NEEDS_DETAIL = new Set([
  'Course Completion Certificate',
  'Internship Completion Certificate',
  'Project Completion Certificate',
  'Participation Certificate',
  'Bonafide Certificate',
]);

// ─── Categories restricted to ONE per student ─────────────────────────────────

export const RESTRICTED_CATEGORIES = new Set([
  'Degree / Graduation Certificate',
  'Merit Certificate',
  'Distinction Certificate',
]);

// ─── Placeholder hints shown in the Certificate Detail input ─────────────────

export const DETAIL_PLACEHOLDER = {
  'Course Completion Certificate':     'e.g. Full Stack Web Development, Data Science, Python Programming',
  'Internship Completion Certificate': 'e.g. Software Development Internship, AI Internship',
  'Project Completion Certificate':    'e.g. Smart Attendance System, IoT Monitoring System',
  'Participation Certificate':         'e.g. National Hackathon, Workshop on AI, Coding Contest',
  'Bonafide Certificate':              'e.g. Higher Studies, Passport Application, Scholarship, Bank Loan',
};

// ─── Dynamic certificate content ─────────────────────────────────────────────
/**
 * Returns the visual text for a certificate.
 *
 * @param {Object} cert  Any certificate object with fields:
 *   certificate_category, certificate_detail, course,
 *   start_year, end_year, cgpa, student_name
 * @returns {{ heading: string, preText: string, prominentText: string, postText: string }}
 *   heading       — replaces "CERTIFICATE OF COMPLETION"
 *   preText       — sentence before the prominent display text
 *   prominentText — displayed large (the course/detail/purpose)
 *   postText      — optional sentence after the prominent text
 */
export function getCertificateBody(cert) {
  const category  = (cert.certificate_category || 'Course Completion Certificate').trim();
  const detail    = (cert.certificate_detail   || '').trim();
  const course    = (cert.course               || '').trim();
  const startYear = cert.start_year ? String(cert.start_year).trim() : '';
  const endYear   = cert.end_year   ? String(cert.end_year).trim()   : '';
  const yearRange = startYear ? `${startYear} – ${endYear}` : endYear;

  switch (category) {

    case 'Degree / Graduation Certificate':
      return {
        heading:       'GRADUATION CERTIFICATE',
        preText:       'has successfully graduated from the university in',
        prominentText: course,
        postText:      yearRange ? `Academic Year: ${yearRange}` : '',
      };

    case 'Course Completion Certificate':
      return {
        heading:       'COURSE COMPLETION CERTIFICATE',
        preText:       'has successfully completed the course of',
        prominentText: detail || course,
        postText:      '',
      };

    case 'Merit Certificate':
      return {
        heading:       'MERIT CERTIFICATE',
        preText:       'is hereby awarded for outstanding academic merit in',
        prominentText: course,
        postText:      yearRange ? `Academic Year: ${yearRange}` : '',
      };

    case 'Distinction Certificate':
      return {
        heading:       'DISTINCTION CERTIFICATE',
        preText:       'has graduated with distinction in',
        prominentText: course,
        postText:      yearRange ? `Academic Year: ${yearRange}` : '',
      };

    case 'Internship Completion Certificate':
      return {
        heading:       'INTERNSHIP COMPLETION CERTIFICATE',
        preText:       'has successfully completed the internship in',
        prominentText: detail || course,
        postText:      '',
      };

    case 'Project Completion Certificate':
      return {
        heading:       'PROJECT COMPLETION CERTIFICATE',
        preText:       'has successfully completed the project titled',
        prominentText: detail || course,
        postText:      '',
      };

    case 'Participation Certificate':
      return {
        heading:       'PARTICIPATION CERTIFICATE',
        preText:       'has successfully participated in',
        prominentText: detail || course,
        postText:      '',
      };

    case 'Academic Excellence Certificate':
      return {
        heading:       'ACADEMIC EXCELLENCE CERTIFICATE',
        preText:       'is recognised for excellent academic performance in',
        prominentText: course,
        postText:      yearRange ? `Academic Year: ${yearRange}` : '',
      };

    case 'Bonafide Certificate':
      return {
        heading:       'BONAFIDE CERTIFICATE',
        preText:       `is a bona fide student of`,
        prominentText: course,
        postText:      `This certificate is issued for the purpose of: ${detail || '—'}`,
      };

    // Graceful fallback — covers old certs with no category
    default:
      return {
        heading:       'CERTIFICATE OF COMPLETION',
        preText:       'has successfully completed the course of study in',
        prominentText: course,
        postText:      '',
      };
  }
}

/**
 * Returns the emoji label for a stored category value.
 * Safe to call with null/undefined — returns the value unchanged.
 */
export function getCategoryLabel(value) {
  if (!value) return '—';
  const found = CATEGORIES.find((c) => c.value === value);
  return found ? found.label : value;
}
