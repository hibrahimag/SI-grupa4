// frontend/src/services/auth.service.js
// Handles all API communication for authentication.

import { apiRequest } from './api.js';

/**
 * Sends login credentials to the backend.
 * @param {string} identifier  – username or email
 * @param {string} password
 * @returns {Promise<{ token: string, user: object }>}
 */
export function loginUser(identifier, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
}

/**
 * Clears the session — call on logout.
 */
export function logoutUser() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
}

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
