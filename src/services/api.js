import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Update the default Authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear storage and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          delete api.defaults.headers.common['Authorization'];
          
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } else {
        // No refresh token, clear storage and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        delete api.defaults.headers.common['Authorization'];
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
  refresh: (refreshToken) => api.post('/auth/refresh/', { refresh: refreshToken }),
  refreshToken: (refresh) => api.post('/auth/refresh/', { refresh }),
  getCurrentUser: () => api.get('/auth/profile/'),
  me: () => api.get('/auth/me/'),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats/'),
  getRecentProjects: () => api.get('/dashboard/recent-projects/'),
  getRecentActivities: () => api.get('/dashboard/recent-activities/'),
};

// Projects API
export const projectsAPI = {
  getAll: (params = {}) => api.get('/projects/', { params }),
  getById: (id) => api.get(`/projects/${id}/`),
  create: (data) => api.post('/projects/', data),
  update: (id, data) => api.put(`/projects/${id}/`, data),
  delete: (id) => api.delete(`/projects/${id}/`),
  getProfitLoss: () => api.get('/projects/profit-loss/'),
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => api.get('/users/', { params }),
  getById: (id) => api.get(`/users/${id}/`),
  getDetails: (id) => axios.get(`${API_BASE_URL.replace('/api', '')}/get_user/${id}/`, {
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  }),
  getHourlyDetails: (id, month) => axios.get(`${API_BASE_URL.replace('/api', '')}/get_user/${id}/`, {
    params: { month },
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  }),
  addFixedDetails: (data) => axios.post(`${API_BASE_URL.replace('/api', '')}/add_fixed_details/`, 
    new URLSearchParams(data),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  ),
  addHourlyDetails: (data) => axios.post(`${API_BASE_URL.replace('/api', '')}/add_hourly_details/`, 
    new URLSearchParams(data),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  ),
  create: (data) => {
    // Use the Django form endpoint that handles designations/technologies properly
    const token = localStorage.getItem('access_token');
    return axios.post(`${API_BASE_URL.replace('/api', '')}/add_user/`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
  },
  update: (id, data) => api.put(`/users/${id}/`, data),
  delete: (id) => api.delete(`/users/${id}/`),
};

// Designations API
export const designationsAPI = {
    getAll: (params = {}) => api.get('/designations/', { params }),
    create: (data) => api.post('/designations/', data),
    update: (id, data) => api.put(`/designations/${id}/`, data),
    delete: (id) => api.delete(`/designations/${id}/`),
};

// Attendance API
export const attendanceAPI = {
  getAll: (params = {}) => api.get('/attendance/', { params }),
  getTodayStatus: () => api.get('/attendance/today-status/'),
  clockIn: (data) => api.post('/attendance/clock-in/', data),
  clockOut: (data) => api.post('/attendance/clock-out/', data),
  break: (data) => api.post('/attendance/break/', data),
  getById: (id) => api.get(`/attendance/${id}/`),
  create: (data) => api.post('/attendance/', data),
  update: (id, data) => api.put(`/attendance/${id}/`, data),
  delete: (id) => api.delete(`/attendance/${id}/`),
  getStats: () => api.get('/attendance/stats/'),
  getAdminDetails: (userId, date) => api.get(`/admin-attendance/${date}/${userId}/`),
  getMonthlyOverview: () => api.get("attendance/monthly-overview/"),
  getUsers: () => api.get("users/"),
};

// Admin can use the same endpoints as regular attendance

// Leaves API
export const leavesAPI = {
  getAll: (params = {}) => api.get('/leaves/', { params }),
  getById: (id) => api.get(`/leaves/${id}/`),
  create: (data) => api.post('/leaves/', data),
  update: (id, data) => api.put(`/leaves/${id}/`, data),
  delete: (id) => api.delete(`/leaves/${id}/`),
  approve: (id) => api.post(`/leaves/${id}/approve/`),
  reject: (id, data) => api.post(`/leaves/${id}/reject/`, data),
};

// Payments API
export const paymentsAPI = {
  projects: {
    getAll: (params = {}) => api.get('/payments/projects/', { params }),
    getById: (id) => api.get(`/payments/projects/${id}/`),
    create: (data) => api.post('/payments/projects/', data),
    update: (id, data) => api.put(`/payments/projects/${id}/`, data),
    delete: (id) => api.delete(`/payments/projects/${id}/`),
  },
  developers: {
    getAll: (params = {}) => api.get('/payments/developers/', { params }),
    getById: (id) => api.get(`/payments/developers/${id}/`),
    update: (id, data) => api.put(`/payments/developers/${id}/`, data),
    delete: (id) => api.delete(`/payments/developers/${id}/`),
  },
};

// Hosting API
export const hostingAPI = {
  getAll: (params = {}) => api.get('/hosting/', { params }),
  getById: (id) => api.get(`/hosting/${id}/`),
  create: (data) => api.post('/hosting/', data),
  update: (id, data) => api.put(`/hosting/${id}/`, data),
  delete: (id) => api.delete(`/hosting/${id}/`),
};

// Roles and Permissions API
export const rolesAPI = {
  getAll: (params = {}) => api.get('/roles/', { params }),
  getById: (id) => api.get(`/roles/${id}/`),
  create: (data) => api.post('/roles/', data),
  update: (id, data) => api.put(`/roles/${id}/`, data),
  delete: (id) => api.delete(`/roles/${id}/`),
};

export const permissionsAPI = {
  getAll: (params = {}) => api.get('/permissions/', { params }),
  getById: (id) => api.get(`/permissions/${id}/`),
  create: (data) => api.post('/permissions/', data),
  update: (id, data) => api.put(`/permissions/${id}/`, data),
  delete: (id) => api.delete(`/permissions/${id}/`),
  initialize: () => api.post('/permissions/initialize/'),
};

// Lookup APIs
export const lookupsAPI = {
  designations: {
    getAll: () => api.get('/lookups/designations/'),
    create: (data) => api.post('/lookups/designations/', data),
  },
  technologies: {
    getAll: () => api.get('/lookups/technologies/'),
    create: (data) => api.post('/lookups/technologies/', data),
  },
  appModes: {
    getAll: (params = {}) => {
      console.log('appModes.getAll called with params:', params);
      const searchParams = new URLSearchParams();
      if (params.search) {
        searchParams.append('search', params.search);
      }
      const url = `/lookups/app-modes/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      console.log('Making request to:', url);
      return api.get(url);
    },
    create: (data) => api.post('/lookups/app-modes/', data),
  },
};

// Quotations API
export const quotationsAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) {
      searchParams.append('search', params.search);
    }
    const url = `/quotations/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    return api.get(url);
  },
  getById: (id) => api.get(`/quotations/${id}/`),
  create: (data) => api.post('/quotations/', data),
  update: (id, data) => api.put(`/quotations/${id}/`, data),
  delete: (id) => api.delete(`/quotations/${id}/`),
  getNextNumber: () => api.get('/quotations/next-number/'),
};

// Domains API
export const domainsAPI = {
  getAll: (params = {}) => api.get('/domains/', { params }),
  getById: (id) => api.get(`/domains/${id}/`),
  create: (data) => api.post('/domains/', data),
  update: (id, data) => api.put(`/domains/${id}/`, data),
  delete: (id) => api.delete(`/domains/${id}/`),
};

// Clients API
export const clientsAPI = {
  getAll: (params = {}) => api.get('/clients/', { params }),
  getById: (id) => api.get(`/clients/${id}/`),
  create: (data) => api.post('/clients/', data),
  update: (id, data) => api.put(`/clients/${id}/`, data),
  delete: (id) => api.delete(`/clients/${id}/`),
};

// File Docs API
export const fileDocsAPI = {
  getFolders: (params = {}) => api.get('/file-docs/folders/', { params }),
  getFolderContents: (folderId) => api.get(`/file-docs/folders/${folderId}/contents/`),
  getSubfolderContents: (subfolderId) => api.get(`/file-docs/subfolders/${subfolderId}/contents/`),
  createFolder: (data) => api.post('/file-docs/folders/', data),
  createSubfolder: (data) => api.post('/file-docs/subfolders/', data),
  uploadFile: (data) => api.post('/file-docs/files/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteFolder: (id) => api.delete(`/file-docs/folders/${id}/`),
  deleteSubfolder: (id) => api.delete(`/file-docs/subfolders/${id}/`),
  deleteFile: (id) => api.delete(`/file-docs/files/${id}/`),
};

// Tasks API
export const tasksAPI = {
  getAll: (params = {}) => api.get('/tasks/', { params }),
  getById: (id) => api.get(`/tasks/${id}/`),
  create: (data) => api.post('/tasks/', data),
  update: (id, data) => api.put(`/tasks/${id}/`, data),
  delete: (id) => api.delete(`/tasks/${id}/`),
  startTask: (id) => api.post(`/tasks/${id}/start/`),
  endTask: (id) => api.post(`/tasks/${id}/end/`),
  getMyTasks: (params = {}) => api.get('/tasks/my/', { params }),
};

// Technologies API
export const technologiesAPI = {
  getAll: (params = {}) => api.get('/lookups/technologies/', { params }),
  getById: (id) => api.get(`/lookups/technologies/${id}/`),
  create: (data) => api.post('/lookups/technologies/', data),
  update: (id, data) => api.put(`/lookups/technologies/${id}/`, data),
  delete: (id) => api.delete(`/lookups/technologies/${id}/`),
};

// App Modes API
export const appModesAPI = {
  getAll: (params = {}) => api.get('/lookups/app-modes/', { params }),
  getById: (id) => api.get(`/lookups/app-modes/${id}/`),
  create: (data) => api.post('/lookups/app-modes/', data),
  update: (id, data) => api.put(`/lookups/app-modes/${id}/`, data),
  delete: (id) => api.delete(`/lookups/app-modes/${id}/`),
};

export default api;
