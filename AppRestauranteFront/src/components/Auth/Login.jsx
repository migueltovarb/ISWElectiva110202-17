import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(username, password);
      if (userData.is_admin) {
        navigate('/admin');
      } else {
        navigate('/mesero');
      }
    } catch {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-2xl sm:px-10 border border-amber-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-amber-800">INICIAR SESIÓN</h2>
            <p className="mt-2 text-sm text-amber-600">Inicia sesión para continuar</p>
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
                className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-200 placeholder-amber-600"
                placeholder="Ingrese su usuario"
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
                className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-200 placeholder-amber-600"
                placeholder="Ingrese su contraseña"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-amber-900 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
              >
                INGRESAR AL SISTEMA
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;