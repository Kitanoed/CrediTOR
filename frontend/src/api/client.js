/** In dev, defaults to /api (Vite proxies to Spring Boot). Set VITE_API_URL for production. */
const API_BASE = import.meta.env.VITE_API_URL || '/api';

let authToken = localStorage.getItem('authToken');

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => authToken || localStorage.getItem('authToken');

const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `API request failed (${response.status})`);
  }

  return data;
};

export const getApiBase = () => API_BASE;

export const auth = {
  signup: (email, password, fullName) =>
    apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    }),

  login: (email, password) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => apiCall('/auth/me', { method: 'GET' }),

  logout: () => {
    setAuthToken(null);
    return apiCall('/auth/logout', { method: 'POST' });
  },
};

export const tor = {
  create: (studentId, fullName, dcn, dateIssued, status = 'Active') =>
    apiCall('/tor', {
      method: 'POST',
      body: JSON.stringify({ studentId, fullName, dcn, dateIssued, status }),
    }),

  list: (page = 1, limit = 20, status = null, search = null) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    return apiCall(`/tor?${params.toString()}`, { method: 'GET' });
  },

  get: (id) => apiCall(`/tor/${id}`, { method: 'GET' }),

  getByDcn: (dcn) => apiCall(`/tor/by-dcn/${encodeURIComponent(dcn)}`, { method: 'GET' }),

  updateStatus: (id, status) =>
    apiCall(`/tor/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  revoke: (id) => apiCall(`/tor/${id}/revoke`, { method: 'POST' }),

  delete: (id) => apiCall(`/tor/${id}`, { method: 'DELETE' }),
};

export const verification = {
  /** DCN only — returns masked details for manual comparison (no photo). */
  byDCN: (dcn) => apiCall(`/verify/by-dcn/${encodeURIComponent(dcn)}`, { method: 'GET' }),

  byTokenWithScan: (token, extractedText) =>
    apiCall(`/verify/by-token/${encodeURIComponent(token)}/scan`, {
      method: 'POST',
      body: JSON.stringify({ extractedText }),
    }),

  /** Upload TOR photo; server uses OCR.space and matches registrar record. */
  byTokenWithPhoto: (token, photoFile) => {
    const formData = new FormData();
    formData.append('photo', photoFile);

    return fetch(`${API_BASE}/verify/by-token/${encodeURIComponent(token)}/scan-photo`, {
      method: 'POST',
      body: formData,
    }).then(async (res) => {
      let data = null;
      try {
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          data = await res.json();
        }
      } catch {
        data = null;
      }
      if (!res.ok) {
        throw new Error(data?.message || data?.error || `API request failed (${res.status})`);
      }
      return data;
    });
  },
};

export const auditLogs = {
  list: (page = 1, limit = 50, eventType = null, dcn = null) => {
    const params = new URLSearchParams({ page, limit });
    if (eventType) params.append('eventType', eventType);
    if (dcn) params.append('dcn', dcn);
    return apiCall(`/audit-logs?${params.toString()}`, { method: 'GET' });
  },

  stats: () => apiCall('/audit-logs/stats', { method: 'GET' }),

  exportCSV: () => {
    const token = getAuthToken();
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(`${API_BASE}/audit-logs/export/csv`, { headers }).then((res) => {
      if (!res.ok) throw new Error('Export failed');
      return res.blob();
    });
  },
};

export const files = {
  upload: (dcn, file) => {
    const formData = new FormData();
    formData.append('dcn', dcn);
    formData.append('file', file);

    const token = getAuthToken();
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    return fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed');
      return data;
    });
  },

  download: (dcn) => {
    const token = getAuthToken();
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(`${API_BASE}/files/download/${encodeURIComponent(dcn)}`, { headers }).then(
      (res) => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      }
    );
  },

  delete: (dcn) => apiCall(`/files/${encodeURIComponent(dcn)}`, { method: 'DELETE' }),
};

export const health = () => apiCall('/health', { method: 'GET' });
