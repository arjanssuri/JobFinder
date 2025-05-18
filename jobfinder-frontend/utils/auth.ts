// utils/auth.ts

// Get the authentication token from local storage
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Check if the user is logged in
export const isLoggedIn = (): boolean => {
  return !!getAuthToken();
};

// Get the current user from local storage
export const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }
  return null;
};

// Add authentication headers to fetch requests
export const withAuth = (headers: HeadersInit = {}): HeadersInit => {
  const token = getAuthToken();
  if (token) {
    return {
      ...headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return headers;
};

// Log out the user
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/auth/login';
  }
};

// Fetch with auth headers
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: withAuth(options.headers || {})
  });
}; 