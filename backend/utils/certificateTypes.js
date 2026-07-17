// Central registry of certificate types: value, label, and the message template
// shown on the certificate/student view. {course}, {start_year}, {end_year}, {student_name} are placeholders.
const CERTIFICATE_TYPES = {
  DEGREE: {
    label: 'Degree / Graduation Certificate',
    heading: 'CERTIFICATE OF GRADUATION',
    message: 'has successfully graduated from the program of study in',
    footerNote: 'Duration: {start_year} - {end_year}',
  },
  PROVISIONAL: {
    label: 'Provisional Certificate',
    heading: 'PROVISIONAL CERTIFICATE',
    message: 'has provisionally completed all requirements for the degree of',
    footerNote: 'Pending final convocation - {end_year}',
  },
  COURSE_COMPLETION: {
    label: 'Course Completion Certificate',
    heading: 'CERTIFICATE OF COURSE COMPLETION',
    message: 'has successfully completed the course of study in',
    footerNote: 'Completed in {end_year}',
  },
  MERIT: {
    label: 'Merit Certificate',
    heading: 'CERTIFICATE OF MERIT',
    message: 'is awarded this certificate of merit for outstanding performance in',
    footerNote: 'Academic Year {end_year}',
  },
  DISTINCTION: {
    label: 'Distinction Certificate',
    heading: 'CERTIFICATE OF DISTINCTION',
    message: 'has completed the program with distinction in',
    footerNote: 'Academic Year {end_year}',
  },
  INTERNSHIP: {
    label: 'Internship Completion Certificate',
    heading: 'INTERNSHIP COMPLETION CERTIFICATE',
    message: 'has successfully completed an internship program in',
    footerNote: 'Duration: {start_year} - {end_year}',
  },
  PROJECT: {
    label: 'Project Completion Certificate',
    heading: 'PROJECT COMPLETION CERTIFICATE',
    message: 'has successfully completed the project work titled',
    footerNote: 'Completed in {end_year}',
  },
  PARTICIPATION: {
    label: 'Participation Certificate',
    heading: 'CERTIFICATE OF PARTICIPATION',
    message: 'is acknowledged for active participation in',
    footerNote: '{end_year}',
  },
  ACADEMIC_EXCELLENCE: {
    label: 'Academic Excellence Certificate',
    heading: 'CERTIFICATE OF ACADEMIC EXCELLENCE',
    message: 'is recognized for excellence in academic performance in',
    footerNote: 'Academic Year {end_year}',
  },
  BONAFIDE: {
    label: 'Bonafide Certificate',
    heading: 'BONAFIDE CERTIFICATE',
    message: 'is a bonafide student of this institution, currently pursuing',
    footerNote: 'As of {end_year}',
  },
};

function getCertificateTypeConfig(type) {
  return CERTIFICATE_TYPES[type] || CERTIFICATE_TYPES.DEGREE;
}

function isValidCertificateType(type) {
  return Object.prototype.hasOwnProperty.call(CERTIFICATE_TYPES, type);
}

module.exports = { CERTIFICATE_TYPES, getCertificateTypeConfig, isValidCertificateType };
