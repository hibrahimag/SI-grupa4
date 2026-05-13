import { apiRequest } from './api';

export async function createListing(data) {
  return apiRequest('/listings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCompanyListings() {
  return apiRequest('/listings/company');
}

export async function getActiveListings() {
  return apiRequest('/listings/active');
}
