const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Authentication API
export const authAPI = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(response);
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Courses API
export const coursesAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const response = await fetch(`${API_BASE_URL}/courses?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (courseData) => {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  update: async (id, courseData) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Teachers API
export const teachersAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/teachers`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (teacherData) => {
    const response = await fetch(`${API_BASE_URL}/teachers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(teacherData)
    });
    return handleResponse(response);
  },

  update: async (id, teacherData) => {
    const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(teacherData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Rooms API
export const roomsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (roomData) => {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData)
    });
    return handleResponse(response);
  },

  update: async (id, roomData) => {
    const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Conflicts API
export const conflictsAPI = {
  getConflicts: async (year, trimester) => {
    const response = await fetch(`${API_BASE_URL}/conflicts?year=${year}&trimester=${trimester}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Statistics API
export const statsAPI = {
  getStats: async (year, trimester) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (trimester) params.append('trimester', trimester);

    const response = await fetch(`${API_BASE_URL}/stats?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Error handling utility
export const handleAPIError = (error) => {
  console.error('API Error:', error);
  
  if (error.message.includes('401') || error.message.includes('403')) {
    // Authentication/authorization error
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
    return 'Session expired. Please login again.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

