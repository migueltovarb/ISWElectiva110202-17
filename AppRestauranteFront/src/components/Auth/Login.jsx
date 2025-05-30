import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('employee');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginEmployee, loginCustomer } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (userType === 'employee') {
        const userData = await loginEmployee(username, password);
        navigate(userData.is_admin ? '/admin' : '/mesero');
      } else {
        await loginCustomer(username, password);
        navigate('/customer-home');
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError(
        err.response?.data?.detail || 
        err.message.includes('401') ? 'Credenciales incorrectas' : 
        'Error al iniciar sesión. Intente nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <Link 
        to="/" 
        className="absolute top-4 left-4 flex items-center text-amber-800 hover:text-amber-600 transition-colors"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
          />
        </svg>
        <span className="ml-1 font-medium">Inicio</span>
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-2xl sm:px-10 border border-amber-200">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-amber-800">INICIAR SESIÓN</h2>
            <p className="mt-2 text-sm text-amber-600">Seleccione su tipo de usuario</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setUserType('employee')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg border border-amber-300 ${
                  userType === 'employee' 
                    ? 'bg-amber-900 text-white border-amber-900' 
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                } transition-colors`}
              >
                Personal
              </button>
              <button
                type="button"
                onClick={() => setUserType('customer')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg border border-amber-300 ${
                  userType === 'customer' 
                    ? 'bg-amber-900 text-white border-amber-900' 
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                } transition-colors`}
              >
                Cliente
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p>{error}</p>
            </div>
          )}

          <form className="mb-0 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-amber-800 mb-1">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-200 placeholder-amber-400"
                placeholder={`Ingrese su usuario${userType === 'customer' ? ' (cliente)' : ''}`}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-amber-800 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-200 placeholder-amber-400"
                placeholder="Ingrese su contraseña"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                  isLoading ? 'bg-amber-700' : 'bg-amber-900 hover:bg-amber-800'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  `INGRESAR COMO ${userType === 'employee' ? 'PERSONAL' : 'CLIENTE'}`
                )}
              </button>
            </div>
          </form>

          {userType === 'customer' && (
            <div className="mt-4 text-center">
              <Link 
                to="/registro-cliente"
                className="text-sm text-amber-700 hover:text-amber-900 font-medium"
              >
                ¿No tienes cuenta? Regístrate aquí
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;