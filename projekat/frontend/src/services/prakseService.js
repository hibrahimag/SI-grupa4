import { apiRequest } from './api';

function withFilter(path, filter) {
  return `${path}?filter=${encodeURIComponent(filter || 'all')}`;
}

export async function getMyPractices(filter = 'all') {
  return apiRequest(withFilter('/prakse/mine', filter));
}

export async function getCompanyPractices(filter = 'all') {
  return apiRequest(withFilter('/prakse/company', filter));
}

export async function getCoordinatorPractices(filter = 'all') {
  return apiRequest(withFilter('/prakse/coordinator', filter));
}
