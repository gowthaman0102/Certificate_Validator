import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import GraduationTemplate        from './GraduationTemplate';
import DistinctionTemplate       from './DistinctionTemplate';
import MeritTemplate             from './MeritTemplate';
import AcademicExcellenceTemplate from './AcademicExcellenceTemplate';
import CourseCompletionTemplate  from './CourseCompletionTemplate';
import InternshipTemplate        from './InternshipTemplate';
import ProjectTemplate           from './ProjectTemplate';
import BonafideTemplate          from './BonafideTemplate';
import ParticipationTemplate     from './ParticipationTemplate';
import { normalizeCategoryName } from '../../utils/certificateCategory';

/* ─────────────────────────────────────────────────────────────────
   Certificate Materialise Animation System
   ─────────────────────────────────────────────────────────────────
   Pure fade-in + subtle y-drift entrance animation without altering
   or overlaying extra lines on top of the certificate's built-in,
   high-resolution authentic borders and typography layout.
   ──────────────────────────────────────────────────────────────── */

const PREMIUM = [0.16, 1, 0.3, 1];

const contentVariants = {
  hidden:  { opacity: 0, y: 6 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: PREMIUM },
  },
};

function CertificateMaterialise({ children, width = 850, height = 580 }) {
  return (
    <motion.div
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      style={{ position: 'relative', display: 'inline-block', width: `${width}px`, height: `${height}px` }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TemplateSelector — picks the right template and passes exact
   pixel dimensions (width x height) to CertificateMaterialise.
   ──────────────────────────────────────────────────────────────── */
const TemplateSelector = forwardRef((props, ref) => {
  const { certificate } = props;
  const category = normalizeCategoryName(certificate?.certificate_category);

  let TemplateComponent;
  let width = 850;
  let height = 580;

  switch (category) {
    case 'Degree / Graduation Certificate':
      TemplateComponent = GraduationTemplate;
      width = 620;
      height = 880;
      break;
    case 'Distinction Certificate':
      TemplateComponent = DistinctionTemplate;
      width = 850;
      height = 600;
      break;
    case 'Merit Certificate':
      TemplateComponent = MeritTemplate;
      width = 850;
      height = 580;
      break;
    case 'Academic Excellence Certificate':
      TemplateComponent = AcademicExcellenceTemplate;
      width = 850;
      height = 580;
      break;
    case 'Course Completion Certificate':
      TemplateComponent = CourseCompletionTemplate;
      width = 850;
      height = 580;
      break;
    case 'Internship Completion Certificate':
      TemplateComponent = InternshipTemplate;
      width = 850;
      height = 580;
      break;
    case 'Project Completion Certificate':
      TemplateComponent = ProjectTemplate;
      width = 850;
      height = 590;
      break;
    case 'Bonafide Certificate':
      TemplateComponent = BonafideTemplate;
      width = 850;
      height = 580;
      break;
    case 'Participation Certificate':
      TemplateComponent = ParticipationTemplate;
      width = 850;
      height = 580;
      break;
    default:
      TemplateComponent = CourseCompletionTemplate;
      width = 850;
      height = 580;
  }

  return (
    <CertificateMaterialise width={width} height={height}>
      <TemplateComponent ref={ref} {...props} />
    </CertificateMaterialise>
  );
});

export default TemplateSelector;
