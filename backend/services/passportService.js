const passportModel = require('../models/passportModel');
const { db } = require('../config/db');

/**
 * Calculates Profile Completion Percentage (0 - 100%)
 */
function calculateCompletionPercentage(profile, skills, projects, internships, certCount) {
  let score = 0;
  if (profile?.profile_picture) score += 10;
  if (profile?.bio) score += 15;
  if (profile?.headline) score += 10;
  if (profile?.department) score += 10;
  if (profile?.program) score += 10;
  if (profile?.graduation_year) score += 5;
  if (skills?.length > 0) score += 15;
  if (projects?.length > 0) score += 15;
  if (internships?.length > 0) score += 5;
  if (certCount > 0) score += 5;
  return Math.min(100, score);
}

/**
 * Algorithmic Profile Score & Badge Generator
 * Beginner (0-250), Intermediate (251-500), Advanced (501-750), Expert (751-1000)
 */
function calculateProfileScore({ certificates = [], skills = [], projects = [], internships = [], publications = [], achievements = [], licenses = [], completion = 0 }) {
  let rawScore = 0;

  // Certificates: 40 pts each (max 240)
  rawScore += Math.min(240, certificates.length * 40);

  // Skills: 15 pts each (max 150)
  rawScore += Math.min(150, skills.length * 15);

  // Projects: 35 pts each (max 210)
  rawScore += Math.min(210, projects.length * 35);

  // Internships: 40 pts each (max 120)
  rawScore += Math.min(120, internships.length * 40);

  // Publications / Patents: 50 pts each (max 100)
  rawScore += Math.min(100, publications.length * 50);

  // Achievements / Hackathons: 25 pts each (max 100)
  rawScore += Math.min(100, achievements.length * 25);

  // Licenses / Cloud Certs: 30 pts each (max 90)
  rawScore += Math.min(90, licenses.length * 30);

  // Profile completion bonus (max 100)
  rawScore += Math.round(completion);

  const numericScore = Math.min(1000, rawScore);

  let level = 'Beginner';
  if (numericScore >= 751) level = 'Expert';
  else if (numericScore >= 501) level = 'Advanced';
  else if (numericScore >= 251) level = 'Intermediate';

  return {
    score: numericScore,
    level,
    breakdown: {
      certificates: Math.min(240, certificates.length * 40),
      skills: Math.min(150, skills.length * 15),
      projects: Math.min(210, projects.length * 35),
      internships: Math.min(120, internships.length * 40),
      publications: Math.min(100, publications.length * 50),
      achievements: Math.min(100, achievements.length * 25),
      licenses: Math.min(90, licenses.length * 30),
      completionBonus: Math.round(completion),
    },
  };
}

/**
 * Fetches verified student certificates from existing certificates table
 */
function getVerifiedStudentCertificates(email, registerNumber) {
  if (!email && !registerNumber) return [];
  const certs = db.prepare(`
    SELECT c.*, u.name as university_name
    FROM certificates c
    LEFT JOIN universities u ON c.university_id = u.id
    WHERE (LOWER(c.student_email) = LOWER(?) OR (c.register_number = ? AND c.register_number != ''))
    ORDER BY c.issue_date DESC
  `).all(email || '', registerNumber || '');
  return certs;
}

/**
 * Assembles complete Digital Skill Passport data for a student
 */
function getFullPassport(userId, userEmail, userRegNumber) {
  const profile = passportModel.getStudentProfile(userId) || {};
  const skills = passportModel.getStudentSkills(userId);
  const projects = passportModel.getStudentProjects(userId);
  const internships = passportModel.getStudentInternships(userId);
  const publications = passportModel.getStudentPublications(userId);
  const achievements = passportModel.getStudentAchievements(userId);
  const licenses = passportModel.getStudentLicenses(userId);
  const settings = passportModel.getPortfolioSettings(userId);

  const certificates = getVerifiedStudentCertificates(userEmail, userRegNumber);

  const completionPercentage = calculateCompletionPercentage(profile, skills, projects, internships, certificates.length);
  const profileScore = calculateProfileScore({
    certificates, skills, projects, internships, publications, achievements, licenses, completion: completionPercentage,
  });

  // Construct Chronological Timeline
  const timelineItems = [
    ...certificates.map((c) => ({
      id: `cert-${c.id}`,
      type: 'CERTIFICATE',
      title: `${c.certificate_category || 'Certificate'}: ${c.course}`,
      subtitle: c.university_name || 'Issuing Institution',
      date: c.issue_date,
      verified: c.status === 'VALID',
      data: c,
    })),
    ...projects.map((p) => ({
      id: `proj-${p.id}`,
      type: 'PROJECT',
      title: p.project_name,
      subtitle: p.tech_stack,
      date: p.end_date || p.start_date || p.created_at,
      verified: false,
      data: p,
    })),
    ...internships.map((i) => ({
      id: `intern-${i.id}`,
      type: 'INTERNSHIP',
      title: `${i.role} at ${i.company}`,
      subtitle: i.duration,
      date: i.created_at,
      verified: i.verification_status === 'VERIFIED',
      data: i,
    })),
    ...publications.map((pub) => ({
      id: `pub-${pub.id}`,
      type: 'PUBLICATION',
      title: pub.title,
      subtitle: `${pub.type} - ${pub.publisher}`,
      date: pub.date || pub.created_at,
      verified: false,
      data: pub,
    })),
    ...achievements.map((ach) => ({
      id: `ach-${ach.id}`,
      type: 'ACHIEVEMENT',
      title: ach.title,
      subtitle: `${ach.category} (${ach.organization})`,
      date: ach.date || ach.created_at,
      verified: false,
      data: ach,
    })),
    ...licenses.map((lic) => ({
      id: `lic-${lic.id}`,
      type: 'LICENSE',
      title: lic.name,
      subtitle: lic.issuer,
      date: lic.issue_date || lic.created_at,
      verified: true,
      data: lic,
    })),
  ].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return {
    profile,
    skills,
    projects,
    internships,
    publications,
    achievements,
    licenses,
    certificates,
    timeline: timelineItems,
    completionPercentage,
    profileScore,
    settings,
  };
}

module.exports = {
  calculateCompletionPercentage,
  calculateProfileScore,
  getVerifiedStudentCertificates,
  getFullPassport,
};
