import client from './client';

/**
 * Generate a signed selective disclosure claim for a certificate.
 * @param {string} certId
 * @param {object} payload { claim_type, claim_value }
 */
export function createDisclosure(certId, payload) {
  return client.post(`/certificates/${certId}/disclosure`, payload);
}

/**
 * Publicly verify a selective disclosure claim by ID.
 * @param {string} disclosureId
 */
export function verifyDisclosure(disclosureId) {
  return client.get(`/disclosures/${disclosureId}/verify`);
}
