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

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true
});

export default api;


// Add request interceptor to attach auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
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
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
