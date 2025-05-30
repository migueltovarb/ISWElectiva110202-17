import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-amber-950 shadow-sm fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <Link 
            to={user.is_admin ? '/admin' : '/mesero'} 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🍔</span>
            <span className="font-bold text-white">AppRestaurante</span>
          </Link>

          <div className="flex-1 flex justify-center">
            <div className="flex space-x-4">
              <Link 
                to="/promociones" 
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  isActive('/promociones') 
                    ? 'bg-amber-700 text-white shadow-inner' 
                    : 'hover:bg-amber-800 text-amber-100'
                }`}
              >
                Promociones
              </Link>

              {user.is_admin && (
                <>
                  <Link 
                    to="/admin/empleados/nuevo" 
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin/empleados/nuevo') 
                        ? 'bg-amber-700 text-white shadow-inner' 
                        : 'hover:bg-amber-800 text-amber-100'
                    }`}
                  >
                    Crear Empleado
                  </Link>
                  <Link 
                    to="/admin" 
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin') 
                        ? 'bg-amber-700 text-white shadow-inner' 
                        : 'hover:bg-amber-800 text-amber-100'
                    }`}
                  >
                    Productos
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              user.is_admin ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {user.tipo_empleado}
            </span>

            <div className="relative">
              <button 
                className="flex items-center space-x-2 focus:outline-none hover:opacity-80 transition-opacity"
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label="Menú de usuario"
              >
                <div className="h-8 w-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-medium shadow-sm">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline text-sm font-medium text-white">
                  {user.username}
                </span>
                <svg 
                  className={`w-4 h-4 text-white transition-transform ${showDropdown ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-20">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors"
                  >
                    <span>🚪</span>
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowDropdown(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Navbar;