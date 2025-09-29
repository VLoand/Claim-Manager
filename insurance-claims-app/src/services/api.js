// API Service Layer for Insurance Claims App
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Helper function to make authenticated requests with automatic token refresh
const makeRequest = async (endpoint, options = {}, isRetry = false) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available and not a public endpoint
  if (token && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register') && !endpoint.startsWith('/auth/refresh')) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    
    // Handle different response types
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // If we get a 401 and have a refresh token, try to refresh
      if (response.status === 401 && !isRetry && localStorage.getItem('refreshToken') && !endpoint.startsWith('/auth/')) {
        try {
          console.log('🔄 Token expired, attempting refresh...');
          // Call refresh endpoint directly to avoid circular dependency
          const refreshToken = localStorage.getItem('refreshToken');
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            console.log('✅ Token refresh successful');
            
            // Update tokens in localStorage
            if (refreshData.token) {
              localStorage.setItem('authToken', refreshData.token);
              localStorage.setItem('user', JSON.stringify(refreshData.user));
              
              if (refreshData.accessToken) {
                localStorage.setItem('accessToken', refreshData.accessToken);
              }
              if (refreshData.refreshToken) {
                localStorage.setItem('refreshToken', refreshData.refreshToken);
              }
            }
            
            // Retry the original request with new token
            return makeRequest(endpoint, options, true);
          } else {
            console.warn('❌ Token refresh failed with status:', refreshResponse.status);
            const refreshErrorData = await refreshResponse.json().catch(() => ({}));
            console.warn('Refresh error details:', refreshErrorData);
          }
        } catch (refreshError) {
          // If refresh fails, clear tokens and throw original error
          console.warn('❌ Token refresh failed with exception:', refreshError);
          localStorage.removeItem('authToken');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
      
      throw new ApiError(
        data.message || data.error || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      error.message || 'Network error occurred',
      0,
      { originalError: error }
    );
  }
};

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    const data = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      // Store legacy token for backwards compatibility
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Store new token format if available
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
    }
    
    return data;
  },

  register: async (userData) => {
    const data = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (data.token) {
      // Store legacy token for backwards compatibility
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Store new token format if available
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
    }
    
    return data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken') || !!localStorage.getItem('accessToken');
  },

  getToken: () => {
    return localStorage.getItem('accessToken') || localStorage.getItem('authToken');
  },

  // Refresh access token using refresh token
  refreshAccessToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const data = await makeRequest('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (data.token) {
        // Update all token formats
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
        }
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
      }

      return data;
    } catch (error) {
      // If refresh fails, clear all tokens
      authAPI.logout();
      throw error;
    }
  },

  // Get current access token (prefers new format, falls back to legacy)
  getAccessToken: () => {
    return localStorage.getItem('accessToken') || localStorage.getItem('authToken');
  }
};

// Claims API
export const claimsAPI = {
  // Get all claims for the current user
  getClaims: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/claims?${queryString}` : '/claims';
    return await makeRequest(endpoint);
  },

  // Get a specific claim by ID
  getClaim: async (id) => {
    return await makeRequest(`/claims/${id}`);
  },

  // Create a new claim
  createClaim: async (claimData) => {
    return await makeRequest('/claims', {
      method: 'POST',
      body: JSON.stringify(claimData),
    });
  },

  // Update a claim
  updateClaim: async (id, updates) => {
    return await makeRequest(`/claims/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Update claim status
  updateClaimStatus: async (id, status, comments = '') => {
    return await makeRequest(`/claims/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, comments }),
    });
  },

  // Delete a claim
  deleteClaim: async (id) => {
    return await makeRequest(`/claims/${id}`, {
      method: 'DELETE',
    });
  },

  // Upload claim documents
  uploadDocuments: async (claimId, files) => {
    const formData = new FormData();
    formData.append('claimId', claimId);
    
    files.forEach((file, index) => {
      formData.append(`documents`, file);
    });

    return await makeRequest(`/claims/${claimId}/documents`, {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  },

  // Get claim statistics
  getClaimStats: async () => {
    return await makeRequest('/claims/stats');
  }
};

// Users API
export const usersAPI = {
  // Get current user profile
  getProfile: async () => {
    return await makeRequest('/users/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return await makeRequest('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Get user notifications
  getNotifications: async () => {
    return await makeRequest('/users/notifications');
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    return await makeRequest(`/users/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }
};

// Document Management API
export const documentsAPI = {
  // Upload documents to a claim
  uploadDocuments: async (claimId, files, category = 'other', description = '') => {
    // Add error checking for files parameter
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('No files provided for upload');
    }
    
    const formData = new FormData();
    
    // Add files to FormData
    for (let i = 0; i < files.length; i++) {
      formData.append('documents', files[i]);
    }
    
    // Add metadata
    formData.append('category', category);
    if (description) {
      formData.append('description', description);
    }

    const token = authAPI.getToken();
    const response = await fetch(`${API_BASE_URL}/claims/${claimId}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.error || 'Upload failed', response.status, errorData);
    }

    return await response.json();
  },

  // Get documents for a claim
  getClaimDocuments: async (claimId) => {
    return await makeRequest(`/claims/${claimId}/documents`);
  },

  // Download a document
  downloadDocument: async (documentId, filename) => {
    const token = authAPI.getToken();
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.error || 'Download failed', response.status, errorData);
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Delete a document
  deleteDocument: async (documentId) => {
    return await makeRequest(`/documents/${documentId}`, 'DELETE');
  },

  // Get document categories
  getCategories: async () => {
    return await makeRequest('/document-categories');
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    return await makeRequest('/health');
  }
};

// Export the ApiError for use in components
export { ApiError };

// Default export with all APIs
export default {
  auth: authAPI,
  claims: claimsAPI,
  users: usersAPI,
  documents: documentsAPI,
  health: healthAPI,
};