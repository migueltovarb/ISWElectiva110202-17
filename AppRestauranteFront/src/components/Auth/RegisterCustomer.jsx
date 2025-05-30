import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterCustomer = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await registerCustomer(username, email, password);
      setSuccess(true);
      setTimeout(() => navigate('/login-cliente'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error en el registro');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-beige-100 p-8 rounded-lg shadow-md text-center border border-amber-200">
          <h2 className="text-3xl font-extrabold text-amber-800">¡Registro exitoso!</h2>
          <p className="mt-2 text-amber-700">Redirigiendo al login...</p>
          <div className="mt-4">
            <div className="w-full bg-amber-200 rounded-full h-2.5">
              <div className="bg-amber-600 h-2.5 rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md border border-amber-200">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-bold text-amber-800">
            Registro de cliente
          </h2>
          <p className="mt-2 text-sm text-amber-700">
            Crea tu cuenta para comenzar
          </p>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-amber-800">
                Nombre de usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-amber-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 bg-amber-50 text-amber-900 placeholder-amber-300"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej: usuario123"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-amber-800">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-amber-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 bg-amber-50 text-amber-900 placeholder-amber-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ej: correo@ejemplo.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-amber-800">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-amber-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 bg-amber-50 text-amber-900 placeholder-amber-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </span>
              ) : 'Registrarse'}
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-amber-700">
          ¿Ya tienes una cuenta?{' '}
          <a href="/login" className="font-medium text-amber-800 hover:text-amber-600 underline">
            Inicia sesión aquí
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterCustomer;