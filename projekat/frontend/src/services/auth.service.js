// frontend/src/services/auth.service.js
// Handles all API communication for authentication.
// Replace BASE_URL with your actual backend URL / env variable.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

/**
 * Sends login credentials to the backend.
 * @param {string} identifier  – username or email
 * @param {string} password
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function loginUser(identifier, password) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Throw the server's message so the UI can display it directly.
    throw new Error(data.message ?? 'Prijava nije uspjela. Pokušajte ponovo.');
  }

  return data; // { token, user: { id, ime, prezime, role, ... } }
}

/**
 * Clears the session — call on logout.
 */
export function logoutUser() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
}
