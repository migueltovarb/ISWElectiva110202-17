import React, { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [logout, navigate]);

  const scrollToSection = useCallback((sectionId = '', closeMenu = false) => {
    if (closeMenu) {
      setMobileMenuOpen(false);
    }

    if (location.pathname !== '/') {
      navigate(`/${sectionId ? `#${sectionId}` : ''}`);
      return;
    }

    if (sectionId) {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, navigate]);

  const NavItem = ({ path, hash, onClick, children, mobile = false }) => {
    const isActive = location.pathname === path && (!hash || location.hash === hash);
    const baseClasses = mobile 
      ? 'block py-3 px-4 text-white hover:bg-amber-700 transition-colors rounded-lg'
      : 'text-white hover:text-amber-200 transition-colors px-3 py-2 rounded-md text-sm font-medium';
    const activeClasses = mobile
      ? 'bg-amber-600 text-white'
      : 'text-amber-300 border-b-2 border-amber-300';

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${isActive ? activeClasses : ''}`}
      >
        {children}
      </button>
    );
  };

  return (
    <nav className="bg-amber-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y menú principal */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex-shrink-0 flex items-center"
              onClick={() => scrollToSection()}
              aria-label="Ir al inicio"
            >
              <span className="text-2xl">🔥</span>
              <span className="ml-2 font-bold text-xl hidden sm:inline text-white">LA RECETA PERFECTA</span>
            </Link>

            <div className="hidden md:block ml-10">
              <div className="flex space-x-4">
                <NavItem onClick={() => scrollToSection()}>
                  INICIO
                </NavItem>
                <NavItem onClick={() => scrollToSection('menu-section')} hash="#menu-section">
                  MENÚ
                </NavItem>
                <NavItem onClick={() => scrollToSection('promociones-section')} hash="#promociones-section">
                  PROMOCIONES
                </NavItem>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative">
                <button
                  className="max-w-xs bg-amber-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-800 focus:ring-white"
                  id="user-menu"
                  aria-haspopup="true"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <span className="sr-only">Abrir menú usuario</span>
                  <div className="h-8 w-8 rounded-full bg-amber-700 flex items-center justify-center text-white">
                    {user?.username?.charAt(0).toUpperCase() || '👤'}
                  </div>
                  <span className="ml-2 text-white hidden lg:inline">{user?.username || 'Cuenta'}</span>
                </button>

                {userDropdownOpen && (
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <Link
                      to="/cuenta"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Mi Cuenta
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-amber-200 hover:text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-800 focus:ring-white"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-amber-700 pb-3 pt-2 px-2 space-y-1">
          <NavItem onClick={() => scrollToSection('', true)} mobile>
            INICIO
          </NavItem>
          <NavItem 
            onClick={() => scrollToSection('menu-section', true)} 
            hash="#menu-section"
            mobile
          >
            MENÚ
          </NavItem>
          <NavItem 
            onClick={() => scrollToSection('promociones-section', true)} 
            hash="#promociones-section"
            mobile
          >
            PROMOCIONES
          </NavItem>
          
          {user ? (
            <>
              <Link
                to="/cuenta"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-amber-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mi Cuenta
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-amber-600"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-amber-800 bg-amber-300 hover:bg-amber-400 text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              INICIAR SESIÓN
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default UserNavbar;