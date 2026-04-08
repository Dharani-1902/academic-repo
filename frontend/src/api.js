const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const api = {
  students: {
    list: () => request('/students'),
    get: (id) => request(`/students/${id}`),
    create: (body) => request('/students', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/students/${id}`, { method: 'DELETE' }),
    history: (id) => request(`/students/${id}/history`),
    addRecord: (id, body) => request(`/students/${id}/records`, { method: 'POST', body: JSON.stringify(body) }),
  },
  courses: {
    list: () => request('/courses'),
  },
};
