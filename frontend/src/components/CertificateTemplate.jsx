import { forwardRef } from 'react';
import CategoryCertificateTemplate from './templates/CategoryCertificateTemplate';

/**
 * Universal Certificate Template Component
 * Delegates directly to CategoryCertificateTemplate so all certificates
 * across Student Dashboard, University Dashboard, Verifier, Passport, and Wallet
 * share the exact same modern, high-resolution, print-friendly design.
 */
const CertificateTemplate = forwardRef((props, ref) => {
  return <CategoryCertificateTemplate ref={ref} {...props} />;
});

export default CertificateTemplate;
