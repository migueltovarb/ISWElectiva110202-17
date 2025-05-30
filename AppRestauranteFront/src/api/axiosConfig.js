import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  // Obtener el token según el tipo de usuario
  const userType = localStorage.getItem('userType');
  const token = userType === 'employee' 
    ? localStorage.getItem('employee_access_token')
    : localStorage.getItem('customer_access_token');
    
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const userType = localStorage.getItem('userType');
        const refreshToken = userType === 'employee'
          ? localStorage.getItem('employee_refresh_token')
          : localStorage.getItem('customer_refresh_token');
        
        const response = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
          refresh: refreshToken
        });
        
        // Guardar el nuevo token según el tipo de usuario
        if (userType === 'employee') {
          localStorage.setItem('employee_access_token', response.data.access);
        } else {
          localStorage.setItem('customer_access_token', response.data.access);
        }
        
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (err) {
        // Limpiar todo y redirigir
        ['employee_access_token', 'employee_refresh_token',
         'customer_access_token', 'customer_refresh_token',
         'user', 'userType'].forEach(item => localStorage.removeItem(item));
        window.location = '/login';
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;