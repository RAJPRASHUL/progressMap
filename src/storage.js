

const API = '/api';

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

let _token = null;

function notifyTasksChanged() {
  window.dispatchEvent(new Event('tasks-changed'));
}

function notifySettingsChanged() {
  window.dispatchEvent(new Event('settings-changed'));
}

export function setToken(t) {
  _token = t;
}
export function getToken() {
  return _token;
}
export function clearToken() {
  _token = null;
}

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

export async function getTasks(from, to) {
  return request('GET', `/tasks?from=${from}&to=${to}`);
}

export async function createTask(task) {
  const data = await request('POST', '/tasks', task);
  notifyTasksChanged();
  return data;
}

export async function updateTask(id, updates) {
  const data = await request('PATCH', `/tasks/${id}`, updates);
  notifyTasksChanged();
  return data;
}

export async function deleteTask(id) {
  const data = await request('DELETE', `/tasks/${id}`);
  notifyTasksChanged();
  return data;
}

export async function getNote(date) {
  return request('GET', `/notes/${date}`);
}

export async function saveNote(date, text) {
  return request('PUT', `/notes/${date}`, { text });
}

export async function getSettings() {
  return request('GET', '/settings');
}

export async function updateSettings(settings) {
  const data = await request('PUT', '/settings', settings);
  notifySettingsChanged();
  return data;
}

export async function deleteAccount() {
  return request('DELETE', '/settings/account');
}
