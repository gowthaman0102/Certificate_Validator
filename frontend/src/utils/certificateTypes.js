export const CERTIFICATE_TYPES = {
  GRADUATION: {
    label: '🎓 Degree / Graduation Certificate',
    value: 'GRADUATION',
  },
  PROVISIONAL: {
    label: '📜 Provisional Certificate',
    value: 'PROVISIONAL',
  },
  COURSE_COMPLETION: {
    label: '📖 Course Completion Certificate',
    value: 'COURSE_COMPLETION',
  },
  MERIT: {
    label: '🏅 Merit Certificate',
    value: 'MERIT',
  },
  DISTINCTION: {
    label: '⭐ Distinction Certificate',
    value: 'DISTINCTION',
  },
  INTERNSHIP: {
    label: '💼 Internship Completion Certificate',
    value: 'INTERNSHIP',
  },
  PROJECT: {
    label: '🔬 Project Completion Certificate',
    value: 'PROJECT',
  },
  PARTICIPATION: {
    label: '🤝 Participation Certificate',
    value: 'PARTICIPATION',
  },
  ACADEMIC_EXCELLENCE: {
    label: '🏆 Academic Excellence Certificate',
    value: 'ACADEMIC_EXCELLENCE',
  },
  BONAFIDE: {
    label: '📚 Bonafide Certificate',
    value: 'BONAFIDE',
  },
};

export function getCertificateTypeLabel(typeValue) {
  return Object.values(CERTIFICATE_TYPES).find(t => t.value === typeValue)?.label || typeValue;
}

export function getCertificateDescription(certificateType, data) {
  switch (certificateType) {
    case 'GRADUATION':
      return `has successfully graduated on ${data.end_year} after completing their degree from ${data.start_year} in`;
    case 'PROVISIONAL':
      return `has provisionally completed their course of study in`;
    case 'COURSE_COMPLETION':
      return `has successfully completed the course of study in`;
    case 'MERIT':
      return `is awarded this merit certificate for excellence in`;
    case 'DISTINCTION':
      return `has earned distinction with exceptional performance in`;
    case 'INTERNSHIP':
      return `has successfully completed the internship program in`;
    case 'PROJECT':
      return `has successfully completed the project in`;
    case 'PARTICIPATION':
      return `has participated in the program in`;
    case 'ACADEMIC_EXCELLENCE':
      return `is awarded for academic excellence in`;
    case 'BONAFIDE':
      return `is hereby certified to be a bonafide student of`;
    default:
      return `has successfully completed the course of study in`;
  }
}
