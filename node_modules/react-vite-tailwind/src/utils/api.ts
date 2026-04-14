export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

export const buildHeaders = (token?: string, json = true): Headers => {
  const headers = new Headers();
  if (json) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
};

export async function apiFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json();
}
