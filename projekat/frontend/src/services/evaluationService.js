// src/services/evaluationService.js

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function authFetch(url, options = {}) {
  const token = sessionStorage.getItem('token');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json(); msg = d.message || d.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ── Kompanija evaluira studenta (US 26) ───────────────────────────────────

/**
 * Dohvata listu prijava za kompaniju koje su u statusu APPROVED (praksa odobrena/završena)
 * i za koje kompanija još nije dala evaluaciju.
 */
export async function getApplicationsForEvaluation() {
  return authFetch(`${API_BASE}/api/evaluations/company/pending`);
}

/**
 * Kompanija šalje evaluaciju studenta.
 * @param {number} applicationId
 * @param {object} data - { tehnickeVjestine, komunikacija, radnaEtika, inicijativa, timskiRad, ukupnaOcjena, komentar }
 */
export async function submitStudentEvaluation(applicationId, data) {
  return authFetch(`${API_BASE}/api/evaluations/company/${applicationId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Kompanija dohvata već poslane evaluacije studenata.
 */
export async function getCompanySubmittedEvaluations() {
  return authFetch(`${API_BASE}/api/evaluations/company/submitted`);
}

// ── Student evaluira kompaniju (US 27) ───────────────────────────────────

/**
 * Dohvata listu prijava studenta u statusu APPROVED za koje student
 * još nije dao evaluaciju kompanije.
 */
export async function getApplicationsForCompanyEvaluation() {
  return authFetch(`${API_BASE}/api/evaluations/student/pending`);
}

/**
 * Student šalje evaluaciju kompanije.
 * @param {number} applicationId
 * @param {object} data - { organizacija, mentorstvo, radnoOkruzenje, relevantnoPosla, preporukaKompanija, ukupnaOcjena, komentar }
 */
export async function submitCompanyEvaluation(applicationId, data) {
  return authFetch(`${API_BASE}/api/evaluations/student/${applicationId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Student dohvata evaluacije koje je kompanija dala za njega.
 */
export async function getMyStudentEvaluations() {
  return authFetch(`${API_BASE}/api/evaluations/student/mine`);
}

/**
 * Kompanija dohvata evaluacije koje su studenti dali za nju.
 */
export async function getCompanyReceivedEvaluations() {
  return authFetch(`${API_BASE}/api/evaluations/company/received`);
}

export async function getMyReceivedEvaluations() {
  return authFetch(`${API_BASE}/api/evaluations/student/received`);
}