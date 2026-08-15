import API from '../../../shared/api/client';

export async function getTemplateList() {
  return await API.get('/templates/list');
}

export async function getUniversityAssignments() {
  return await API.get('/templates/assignments');
}

export async function assignTemplateToCategory(category, templateKey) {
  return await API.post('/templates/assign', { category, template_key: templateKey });
}

export async function getActiveTemplate(category, universityId) {
  return await API.get(`/templates/active`, { params: { category, university_id: universityId } });
}
