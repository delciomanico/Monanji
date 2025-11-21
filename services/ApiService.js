import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://192.168.100.23:3000/api/v1' 
  : 'https://your-production-api.com/api/v1';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth token
  async getAuthToken() {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Helper method to set auth token
  async setAuthToken(token) {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  // Helper method to remove auth token
  async removeAuthToken() {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      headers: defaultHeaders,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.token) {
      await this.setAuthToken(response.data.token);
    }

    return response;
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.token) {
      await this.setAuthToken(response.data.token);
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      await this.removeAuthToken();
    }
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  // Complaint methods
  async submitComplaint(complaintData) {
    return await this.request('/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    });
  }

  async getComplaintByProtocol(protocolNumber) {
    return await this.request(`/complaints/${protocolNumber}`);
  }

  async getMyComplaints(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/complaints/my${queryParams ? `?${queryParams}` : ''}`;
    return await this.request(endpoint);
  }

  async updateComplaint(complaintId, updateData) {
    return await this.request(`/complaints/${complaintId}/update`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Search methods
  async searchMissingPersons(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/search/missing-persons${queryParams ? `?${queryParams}` : ''}`;
    return await this.request(endpoint);
  }

  async searchCasesByBI(biNumber) {
    const queryParams = new URLSearchParams({ bi_number: biNumber }).toString();
    return await this.request(`/search/cases?${queryParams}`);
  }

  // Evidence/file upload methods
  async uploadEvidence(complaintId, files, descriptions = []) {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append('files', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || `evidence_${index}.jpg`,
      });

      if (descriptions[index]) {
        formData.append('descriptions', descriptions[index]);
      }
    });

    const token = await this.getAuthToken();
    const url = `${this.baseURL}/evidence/${complaintId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : undefined,
        // Don't set Content-Type for FormData - let the browser set it with boundary
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Upload failed: ${response.status}`);
    }

    return data;
  }

  async getComplaintEvidence(complaintId) {
    return await this.request(`/evidence/${complaintId}`);
  }

  async deleteEvidence(evidenceId) {
    return await this.request(`/evidence/${evidenceId}`, {
      method: 'DELETE',
    });
  }

  // Statistics methods
  async getDashboardStats() {
    return await this.request('/stats/dashboard');
  }

  async getMyStats() {
    return await this.request('/stats/my-summary');
  }

  // Notification methods
  async getNotifications(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/notifications${queryParams ? `?${queryParams}` : ''}`;
    return await this.request(endpoint);
  }

  async markNotificationRead(notificationId) {
    return await this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return await this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;

// Export specific methods for easier imports
export const {
  register,
  login,
  logout,
  getCurrentUser,
  submitComplaint,
  getComplaintByProtocol,
  getMyComplaints,
  updateComplaint,
  searchMissingPersons,
  searchCasesByBI,
  uploadEvidence,
  getComplaintEvidence,
  deleteEvidence,
  getDashboardStats,
  getMyStats,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  healthCheck,
} = apiService;
