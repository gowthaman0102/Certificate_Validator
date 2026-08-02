import { forwardRef } from 'react';
import TemplateSelector from './TemplateSelector';

/**
 * CategoryCertificateTemplate
 *
 * Wraps TemplateSelector with forwardRef so that parent components
 * (UniversityDashboard, StudentDashboard, Verifier, etc.) can pass
 * refs for html2canvas/PDF capture without causing blank screen crashes.
 */
const CategoryCertificateTemplate = forwardRef((props, ref) => (
  <TemplateSelector ref={ref} {...props} />
));

CategoryCertificateTemplate.displayName = 'CategoryCertificateTemplate';

export default CategoryCertificateTemplate;
