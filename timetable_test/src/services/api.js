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

// Academic Years API
export const academicYearsAPI = {
  getAll: async () => {
    console.log('Fetching academic years...');
    const response = await fetch(`${API_BASE_URL}/academic-years`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(response);
    console.log('Academic years received:', data);
    return data;
  },

  create: async (year) => {
    const response = await fetch(`${API_BASE_URL}/academic-years`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ year: parseInt(year) })
    });
    return handleResponse(response);
  },

  delete: async (year) => {
    const response = await fetch(`${API_BASE_URL}/academic-years/${year}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Import/Export API
export const importAPI = {
  importTeachers: async (file) => {
    const formData = new FormData();
    formData.append('csvFile', file);
    
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/import/teachers`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    });
    return handleResponse(response);
  },

  importCourses: async (file) => {
    const formData = new FormData();
    formData.append('csvFile', file);
    
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/import/courses`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    });
    return handleResponse(response);
  },

  getTeachersTemplate: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/import/teachers/template`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to download template');
    }
    
    return response.blob();
  },

  getCoursesTemplate: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/import/courses/template`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to download template');
    }
    
    return response.blob();
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

