import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // 'employee' o 'customer'

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedUserType = localStorage.getItem('userType');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setUserType(storedUserType);
    }
    setLoading(false);
  }, []);

  // Login genérico (para compatibilidad con componentes como Login.jsx)
  const login = async (username, password) => {
    try {
      return await loginEmployee(username, password);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  // Login para empleados
  const loginEmployee = async (username, password) => {
    const response = await api.post('/auth/token/', { username, password });
    const userData = {
      id: response.data.user_id,
      username: response.data.username,
      tipo_empleado: response.data.tipo_empleado,
      is_admin: response.data.is_admin
    };
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', 'employee');
    setUser(userData);
    setUserType('employee');
    return userData;
  };

  // Login para clientes
  const loginCustomer = async (username, password) => {
    const response = await api.post('/clientes/login/', { usuario: username, password });
    const userData = {
      id: response.data.user_id,
      username: response.data.usuario,
      email: response.data.email
    };
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', 'customer');
    setUser(userData);
    setUserType('customer');
    return userData;
  };

  // Registro para clientes
  const registerCustomer = async (username, email, password) => {
    const response = await api.post('/clientes/registro/', {
      usuario: username,
      email: email,
      password: password
    });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    setUser(null);
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      userType,
      login,              // 👈 función genérica
      loginEmployee, 
      loginCustomer,
      registerCustomer,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
