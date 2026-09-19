/**
 * storage.js — centralised data layer.
 * Every API call in the app goes through this module.
 * Components import functions from here and never call fetch() directly.
 */

const API = '/api';

// ── helpers ──────────────────────────────────────────────────────────

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API}${path}`, opts);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(data?.message || res.statusText);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ── token management (in-memory only) ────────────────────────────────

let _token = null;

export function setToken(t) {
  _token = t;
}
export function getToken() {
  return _token;
}
export function clearToken() {
  _token = null;
}

// ── auth ─────────────────────────────────────────────────────────────

export async function register(email, password, name) {
  const data = await request('POST', '/auth/register', { email, password, name });
  if (data?.token) setToken(data.token);
  return data;
}

export async function login(email, password) {
  const data = await request('POST', '/auth/login', { email, password });
  if (data?.token) setToken(data.token);
  return data;
}

// ── tasks ────────────────────────────────────────────────────────────

export async function getTasks(from, to) {
  return request('GET', `/tasks?from=${from}&to=${to}`);
}

export async function createTask(task) {
  return request('POST', '/tasks', task);
}

export async function updateTask(id, updates) {
  return request('PATCH', `/tasks/${id}`, updates);
}

export async function deleteTask(id) {
  return request('DELETE', `/tasks/${id}`);
}

// ── notes ────────────────────────────────────────────────────────────

export async function saveNote(date, text) {
  return request('PUT', `/notes/${date}`, { text });
}

// ── settings ─────────────────────────────────────────────────────────

export async function getSettings() {
  return request('GET', '/settings');
}

export async function updateSettings(settings) {
  return request('PUT', '/settings', settings);
}
