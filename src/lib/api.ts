const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
// Ensure BASE_URL cleanly ends with /api, avoiding double slashes or missing /api.
const cleanEnvUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
const BASE_URL = cleanEnvUrl.endsWith('/api') ? cleanEnvUrl : `${cleanEnvUrl}/api`;


const getHeaders = (omitContentType = false) => {
  const headers: Record<string, string> = {};
  if (!omitContentType) headers['Content-Type'] = 'application/json';
  const userInfoString = localStorage.getItem('userInfo');
  if (userInfoString) {
    try {
      const userInfo = JSON.parse(userInfoString);
      if (userInfo.token) {
        headers['Authorization'] = `Bearer ${userInfo.token}`;
      }
    } catch (e) {
      console.error('Failed to parse user info', e);
    }
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return { data };
};

const api = {
  get: async <T>(url: string, options?: { params?: Record<string, any> }) => {
    let finalUrl = `${BASE_URL}${url}`;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
      finalUrl += `?${searchParams.toString()}`;
    }
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response) as Promise<{ data: T }>;
  },
  post: async <T>(url: string, body: any) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response) as Promise<{ data: T }>;
  },
  put: async <T>(url: string, body: any) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response) as Promise<{ data: T }>;
  },
  delete: async <T>(url: string) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response) as Promise<{ data: T }>;
  },
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'Upload failed');
    return { url: result.url };
  },
};

export default api;
