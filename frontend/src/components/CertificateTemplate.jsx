import { forwardRef } from 'react';
import TemplateSelector from './templates/TemplateSelector';

/**
 * Universal Certificate Template Component
 * Delegates directly to TemplateSelector so all certificates
 * across Student Dashboard, University Dashboard, Verifier, Passport, and Wallet
 * share the exact same modern, high-resolution, print-friendly design.
 */
const CertificateTemplate = forwardRef((props, ref) => {
  return <TemplateSelector ref={ref} {...props} />;
});

export default CertificateTemplate;
