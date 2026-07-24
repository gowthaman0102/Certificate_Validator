import API from './client';

export async function getMyPassport() {
  return await API.get('/passport/profile');
}

export async function updatePassportProfile(profileData) {
  return await API.post('/passport/profile', profileData);
}

export async function addPassportSkill(skillData) {
  return await API.post('/passport/skills', skillData);
}

export async function deletePassportSkill(id) {
  return await API.delete(`/passport/skills/${id}`);
}

export async function addPassportProject(projectData) {
  return await API.post('/passport/projects', projectData);
}

export async function deletePassportProject(id) {
  return await API.delete(`/passport/projects/${id}`);
}

export async function addPassportInternship(internshipData) {
  return await API.post('/passport/internships', internshipData);
}

export async function deletePassportInternship(id) {
  return await API.delete(`/passport/internships/${id}`);
}

export async function addPassportPublication(pubData) {
  return await API.post('/passport/publications', pubData);
}

export async function deletePassportPublication(id) {
  return await API.delete(`/passport/publications/${id}`);
}

export async function addPassportAchievement(achData) {
  return await API.post('/passport/achievements', achData);
}

export async function deletePassportAchievement(id) {
  return await API.delete(`/passport/achievements/${id}`);
}

export async function addPassportLicense(licData) {
  return await API.post('/passport/licenses', licData);
}

export async function deletePassportLicense(id) {
  return await API.delete(`/passport/licenses/${id}`);
}

export async function updatePassportSettings(settingsData) {
  return await API.post('/passport/settings', settingsData);
}

export async function getPublicPassport(id) {
  return await API.get(`/passport/public/${id}`);
}

export async function logPassportExport(type) {
  return await API.post('/passport/log-export', { type });
}
