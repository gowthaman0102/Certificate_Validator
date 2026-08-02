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
  { value: 'Degree / Graduation Certificate',    label: 'Degree / Graduation Certificate' },
  { value: 'Course Completion Certificate',       label: 'Course Completion Certificate' },
  { value: 'Merit Certificate',                  label: 'Merit Certificate' },
  { value: 'Distinction Certificate',             label: 'Distinction Certificate' },
  { value: 'Internship Completion Certificate',   label: 'Internship Completion Certificate' },
  { value: 'Project Completion Certificate',      label: 'Project Completion Certificate' },
  { value: 'Participation Certificate',           label: 'Participation Certificate' },
  { value: 'Academic Excellence Certificate',     label: 'Academic Excellence Certificate' },
  { value: 'Bonafide Certificate',                label: 'Bonafide Certificate' },
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
  'Internship Completion Certificate': 'e.g. Software Development Internship, AI Research Internship',
  'Project Completion Certificate':    'e.g. Smart Attendance System, IoT Monitoring System',
  'Participation Certificate':         'e.g. Smart India Hackathon, National Workshop on AI, Coding Contest',
  'Bonafide Certificate':              'e.g. Higher Studies, Passport Application, Scholarship, Bank Loan',
};

// ─── Subcategory keyword detector for Participation Certificates ──────────────
/**
 * Given the detail string, detect what kind of participation event it is
 * and return a tailored { subHeading, lines[] } descriptor.
 */
function detectParticipationSubtype(detail, course) {
  const d = detail.toLowerCase();

  // Hackathon variants
  if (d.includes('hackathon') || d.includes('hack')) {
    return {
      subHeading: 'Hackathon Certificate',
      lines: [
        `participated in the ${detail},`,
        `demonstrating exceptional problem-solving ability, innovative thinking,`,
        `and technical expertise in a competitive national-level event.`,
      ],
    };
  }

  // Smart India Hackathon specifically
  if (d.includes('sih') || d.includes('smart india')) {
    return {
      subHeading: 'Smart India Hackathon',
      lines: [
        `participated in the Smart India Hackathon,`,
        `contributing towards innovative solutions for real-world national challenges`,
        `through collaborative engineering and creative problem-solving.`,
      ],
    };
  }

  // Workshop
  if (d.includes('workshop')) {
    return {
      subHeading: 'Workshop Participation',
      lines: [
        `has actively participated in the ${detail},`,
        `gaining hands-on exposure to cutting-edge tools, methodologies,`,
        `and industry best practices in the domain of ${course || 'the relevant field'}.`,
      ],
    };
  }

  // Seminar / Symposium
  if (d.includes('seminar') || d.includes('symposium') || d.includes('conference')) {
    return {
      subHeading: 'Seminar / Conference',
      lines: [
        `has successfully participated in the ${detail},`,
        `engaging with thought leaders and subject matter experts`,
        `and contributing to the academic discourse in ${course || 'the relevant field'}.`,
      ],
    };
  }

  // Coding contest / competitive programming
  if (
    d.includes('coding') || d.includes('contest') ||
    d.includes('competitive') || d.includes('olympiad') || d.includes('quiz')
  ) {
    return {
      subHeading: 'Competitive Event',
      lines: [
        `has successfully participated in the ${detail},`,
        `showcasing strong analytical skills, logical reasoning,`,
        `and a competitive spirit in the field of ${course || 'engineering and technology'}.`,
      ],
    };
  }

  // Sports / Cultural
  if (
    d.includes('sports') || d.includes('cultural') ||
    d.includes('fest') || d.includes('game') || d.includes('athletics')
  ) {
    return {
      subHeading: 'Event Participation',
      lines: [
        `has actively participated in the ${detail},`,
        `demonstrating sportsmanship, teamwork, and dedication`,
        `in representing the institution at the event.`,
      ],
    };
  }

  // Generic fallback for participation
  return {
    subHeading: 'Participation Certificate',
    lines: [
      `has successfully participated in the ${detail || 'specified programme'},`,
      `demonstrating commitment, engagement, and collaborative spirit`,
      `throughout the duration of the event.`,
    ],
  };
}

// ─── Dynamic certificate content ─────────────────────────────────────────────
/**
 * Returns the visual text for a certificate — unique per category and subcategory.
 *
 * @param {Object} cert  Any certificate object with fields:
 *   certificate_category, certificate_detail, course,
 *   start_year, end_year, cgpa, student_name, register_number
 * @returns {{
 *   heading: string,        — main certificate heading (replaces category title)
 *   subHeading: string,     — italic sub-heading below heading (optional)
 *   lines: string[],        — 2–3 content lines below the student name
 * }}
 */
export function getCertificateBody(cert) {
  const category  = (cert.certificate_category || 'Course Completion Certificate').trim();
  const detail    = (cert.certificate_detail   || '').trim();
  const course    = (cert.course               || '').trim();
  const regNo     = (cert.register_number      || '').trim();
  const startYear = cert.start_year ? String(cert.start_year).trim() : '';
  const endYear   = cert.end_year   ? String(cert.end_year).trim()   : '';
  const yearRange = startYear ? `${startYear} – ${endYear}` : endYear;
  const cgpa      = cert.cgpa ? String(cert.cgpa).trim() : '';

  switch (category) {

    // ── Graduation ──────────────────────────────────────────────────────────
    case 'Degree / Graduation Certificate':
      return {
        heading:    'Degree Certificate',
        subHeading: course ? `Department of ${course}` : '',
        lines: [
          `has successfully fulfilled all the academic requirements and`,
          `graduated from the ${course || 'prescribed programme of study'}${yearRange ? ` for the academic year ${yearRange}` : ''}.`,
          cgpa ? `This degree is awarded in recognition of outstanding academic performance with a CGPA of ${cgpa}.` : `This degree is awarded in recognition of committed academic pursuit and achievement.`,
        ],
      };

    // ── Course Completion ───────────────────────────────────────────────────
    case 'Course Completion Certificate':
      return {
        heading:    'Course Completion Certificate',
        subHeading: detail || course,
        lines: [
          `has successfully completed the prescribed course of study in`,
          `${detail || course}${yearRange ? `, spanning the academic period ${yearRange}` : ''}.`,
          cgpa
            ? `The course was completed with a commendable grade of ${cgpa}, reflecting dedication and academic excellence.`
            : `This certificate is issued in recognition of consistent effort and satisfactory completion of all coursework.`,
        ],
      };

    // ── Merit ───────────────────────────────────────────────────────────────
    case 'Merit Certificate':
      return {
        heading:    'Merit Certificate',
        subHeading: course ? `Department of ${course}` : '',
        lines: [
          `is hereby recognised and awarded for achieving outstanding academic merit`,
          `in the ${course || 'programme of study'}${yearRange ? ` during the academic year ${yearRange}` : ''}.`,
          cgpa
            ? `This award is conferred in acknowledgement of securing a CGPA of ${cgpa}, placing the student among the top academic achievers.`
            : `This award reflects exemplary commitment to academic excellence and scholarly distinction.`,
        ],
      };

    // ── Distinction ─────────────────────────────────────────────────────────
    case 'Distinction Certificate':
      return {
        heading:    'Distinction Certificate',
        subHeading: course ? `Department of ${course}` : '',
        lines: [
          `has graduated with Distinction in the ${course || 'programme of study'},`,
          `having demonstrated exceptional academic rigour and intellectual achievement${yearRange ? ` throughout the academic period ${yearRange}` : ''}.`,
          cgpa
            ? `This distinction is conferred upon attaining a CGPA of ${cgpa}, a mark of extraordinary academic accomplishment.`
            : `This certificate stands as a formal recognition of superior academic performance and scholarly excellence.`,
        ],
      };

    // ── Internship ──────────────────────────────────────────────────────────
    case 'Internship Completion Certificate':
      return {
        heading:    'Internship Completion Certificate',
        subHeading: detail || 'Industry Internship Programme',
        lines: [
          `has successfully completed the internship in ${detail || course},`,
          `gaining practical industry exposure, professional experience,`,
          `and applied knowledge in the domain of ${course || 'engineering and technology'}.`,
        ],
      };

    // ── Project ─────────────────────────────────────────────────────────────
    case 'Project Completion Certificate':
      return {
        heading:    'Project Completion Certificate',
        subHeading: detail ? `Project: ${detail}` : '',
        lines: [
          `has successfully designed, developed, and completed the project titled`,
          `"${detail || course}",`,
          `demonstrating technical proficiency, creative problem-solving, and disciplined project execution in the field of ${course || 'engineering and technology'}.`,
        ],
      };

    // ── Participation ───────────────────────────────────────────────────────
    case 'Participation Certificate': {
      const sub = detectParticipationSubtype(detail, course);
      return {
        heading:    sub.subHeading,
        subHeading: detail || '',
        lines:      sub.lines,
      };
    }

    // ── Academic Excellence ──────────────────────────────────────────────────
    case 'Academic Excellence Certificate':
      return {
        heading:    'Academic Excellence Certificate',
        subHeading: course ? `Department of ${course}` : '',
        lines: [
          `is recognised and honoured for demonstrating exemplary academic excellence`,
          `in ${course || 'the programme of study'}${yearRange ? ` for the academic year ${yearRange}` : ''}.`,
          cgpa
            ? `This recognition is conferred upon achieving a distinguished CGPA of ${cgpa}, placing this student among the most accomplished scholars.`
            : `This certificate is a formal acknowledgement of unwavering dedication, intellectual curiosity, and scholastic achievement.`,
        ],
      };

    // ── Bonafide ────────────────────────────────────────────────────────────
    case 'Bonafide Certificate':
      return {
        heading:    'Bonafide Certificate',
        subHeading: detail ? `Purpose: ${detail}` : '',
        lines: [
          `is a bona fide student of the ${course || 'prescribed programme'} at this institution`,
          yearRange ? `and has been enrolled for the academic period ${yearRange}.` : `and is currently enrolled in the programme.`,
          `This certificate is issued in good faith for the purpose of: ${detail || 'official use'}, and is valid for all legal and official purposes.`,
        ],
      };

    // ── Fallback ─────────────────────────────────────────────────────────────
    default:
      return {
        heading:    category,
        subHeading: detail || '',
        lines: [
          `has successfully fulfilled all requirements for the ${category}`,
          `in the ${course || 'programme of study'}${yearRange ? ` for the academic period ${yearRange}` : ''}.`,
          `This certificate is issued as a formal record of academic achievement and commitment.`,
        ],
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
