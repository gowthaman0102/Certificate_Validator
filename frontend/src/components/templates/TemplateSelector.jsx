import React, { forwardRef } from 'react';
import GraduationTemplate from './GraduationTemplate';
import DistinctionTemplate from './DistinctionTemplate';
import MeritTemplate from './MeritTemplate';
import AcademicExcellenceTemplate from './AcademicExcellenceTemplate';
import CourseCompletionTemplate from './CourseCompletionTemplate';
import InternshipTemplate from './InternshipTemplate';
import ProjectTemplate from './ProjectTemplate';
import BonafideTemplate from './BonafideTemplate';
import ParticipationTemplate from './ParticipationTemplate';

const TemplateSelector = forwardRef((props, ref) => {
  const { certificate } = props;
  const category = certificate?.certificate_category;

  switch (category) {
    case 'Degree / Graduation Certificate':
      return <GraduationTemplate ref={ref} {...props} />;
    case 'Distinction Certificate':
      return <DistinctionTemplate ref={ref} {...props} />;
    case 'Merit Certificate':
      return <MeritTemplate ref={ref} {...props} />;
    case 'Academic Excellence Certificate':
      return <AcademicExcellenceTemplate ref={ref} {...props} />;
    case 'Course Completion Certificate':
      return <CourseCompletionTemplate ref={ref} {...props} />;
    case 'Internship Completion Certificate':
      return <InternshipTemplate ref={ref} {...props} />;
    case 'Project Completion Certificate':
      return <ProjectTemplate ref={ref} {...props} />;
    case 'Bonafide Certificate':
      return <BonafideTemplate ref={ref} {...props} />;
    case 'Participation Certificate':
      return <ParticipationTemplate ref={ref} {...props} />;
    default:
      return <CourseCompletionTemplate ref={ref} {...props} />;
  }
});

export default TemplateSelector;
