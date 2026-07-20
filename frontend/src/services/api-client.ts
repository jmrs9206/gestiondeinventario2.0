const BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080');

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await authenticatedFetch(path, options);

  if (!response.ok) {
    let errorMessage = `API Error ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Ignore
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const result = await response.json();
  return result.data !== undefined ? result.data : result;
}

export async function authenticatedFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const request = {
    ...options,
    headers,
    credentials: 'include' as RequestCredentials,
  };

  let response = await fetch(`${BASE_URL}${path}`, request);

  if (response.status === 401 && typeof window !== 'undefined') {
    const refreshed = await refreshAccessCookie();
    if (refreshed) {
      response = await fetch(`${BASE_URL}${path}`, request);
    }
  }

  if (response.status === 401 || response.status === 403) {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    throw new Error('Unauthorized or Forbidden');
  }

  return response;
}

async function refreshAccessCookie(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    });
    return response.ok;
  } catch {
    return false;
  }
}
