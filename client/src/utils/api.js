import axios from 'axios';

// Global variable to hold the snackbar reference
let enqueueSnackbar = null;

// Function to set the snackbar reference
export const setEnqueueSnackbarRef = (ref) => {
  enqueueSnackbar = ref;
};

// Helper function to show notifications
export const showNotification = (message, options = {}) => {
  if (enqueueSnackbar) {
    enqueueSnackbar(message, options);
  }
};

// Muhit o'zgaruvchisiga to'g'ri kirish
let apiUrl = 'https://multilevel-speaking.onrender.com';

// Agar REACT_APP_ prefixli env mavjud bo'lsa, uni qo'llaymiz
if (process.env.REACT_APP_API_URL) {
  apiUrl = process.env.REACT_APP_API_URL;
}

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true
});

// Add request interceptor to attach auth token
api.interceptors.request.use(
  config => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['x-auth-token'] = token;
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for global error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Xavfsiz hatolik qaytish
    try {
      const { status, data } = error.response || {};
      
      // Show error notification if snackbar is available
      if (enqueueSnackbar && data && data.message) {
        enqueueSnackbar(data.message, { 
          variant: 'error',
          autoHideDuration: 5000
        });
      }
      
      // Handle token expiration
      if (status === 401) {
        try {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } catch (err) {
          console.error('Error during logout:', err);
        }
      }
    } catch (err) {
      console.error('Error in response interceptor:', err);
    }
    
    return Promise.reject(error);
  }
);

export default api;
