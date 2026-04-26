import { apiRequest } from './api.js';

export function getUsers(status) {
  const query = status ? `?status=${status}` : '';
  return apiRequest(`/admin/users${query}`);
}

export function updateUserRole(id, role) {
  return apiRequest(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}
