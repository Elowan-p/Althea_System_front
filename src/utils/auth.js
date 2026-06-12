// Pure helpers for reading the authenticated user from localStorage.

export function getToken() {
  return localStorage.getItem('token');
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

export function isAuthenticated() {
  return !!getToken();
}

export function isAdminUser() {
  return !!getStoredUser()?.roles?.includes('ROLE_ADMIN');
}

export function isAdminTwoFaVerified() {
  return !!localStorage.getItem('adminTwoFaVerified');
}
