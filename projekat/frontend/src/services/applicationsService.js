import { apiRequest } from './api';

export async function getMyApplications() {
  return apiRequest('/applications/mine');
}

export async function createApplication(oglasID) {
  return apiRequest('/applications', {
    method: 'POST',
    body: JSON.stringify({ oglasID }),
  });
}
