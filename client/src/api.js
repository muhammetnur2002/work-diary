const API_BASE = '/api';

async function request(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
    };
    const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.reload();
    throw new Error('Unauthorized');
    }
    if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Ошибка запроса');
    }
    return res.json();
}

export const api = {
    register: (username, passwordHash) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ username, passwordHash }) }),
login: (username, passwordHash) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, passwordHash }) }),
    getEntries: (month) => request(`/entries?month=${month}`),
    saveEntry: (data, id) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/entries/${id}` : '/entries';
    return request(url, { method, body: JSON.stringify(data) });
    },
    deleteEntry: (id) => request(`/entries/${id}`, { method: 'DELETE' }),
    getHourlyRate: () => request('/settings/hourly_rate'),
    updateHourlyRate: (value) =>
    request('/settings/hourly_rate', { method: 'PUT', body: JSON.stringify({ value }) }),
    getAdvance: (month) => request(`/advances/${month}`),
    updateAdvance: (month, amount) =>
    request(`/advances/${month}`, { method: 'PUT', body: JSON.stringify({ amount }) }),
    getSummary: (month) => request(`/summary?month=${month}`),
};