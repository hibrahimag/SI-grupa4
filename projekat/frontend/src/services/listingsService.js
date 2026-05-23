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

export async function updateListing(id, data) {
  return apiRequest(`/listings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getClosedListings() {
  return apiRequest('/listings/closed');
}

export async function getCompanyClosedListings() {
  return apiRequest('/listings/company/closed');
}
