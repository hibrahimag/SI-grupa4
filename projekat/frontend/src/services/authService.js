import { apiRequest } from './api.js';

export function getPublicFaculties() {
  return apiRequest('/auth/faculties');
}

export function checkAvailability(type, value) {
  return apiRequest(`/auth/check?type=${encodeURIComponent(type)}&value=${encodeURIComponent(value)}`);
}

export function register(data) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
