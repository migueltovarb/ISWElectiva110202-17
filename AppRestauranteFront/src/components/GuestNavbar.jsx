import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const GuestNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const scrollToSection = (sectionId, closeMenu = false) => {
    if (location.pathname !== '/') {
      navigate(`/${sectionId ? `#${sectionId}` : ''}`);
      return;
    }

    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (closeMenu) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="bg-[#81412f] text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center space-x-2"
            onClick={() => scrollToSection()}
          >
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-xl hidden sm:inline">LA RECETA PERFECTA</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => scrollToSection()}
              className={`hover:text-yellow-200 transition-colors ${isActive('/') ? 'font-bold border-b-2 border-yellow-200' : ''}`}
            >
              INICIO
            </button>
            <button
              onClick={() => scrollToSection('menu-section')}
              className={`hover:text-yellow-200 transition-colors ${location.hash === '#menu-section' ? 'font-bold border-b-2 border-yellow-200' : ''}`}
            >
              MENÚ
            </button>
            <button
              onClick={() => scrollToSection('promociones-section')}
              className={`hover:text-yellow-200 transition-colors ${location.hash === '#promociones-section' ? 'font-bold border-b-2 border-yellow-200' : ''}`}
            >
              PROMOCIONES
            </button>
            <Link 
              to="/login" 
              className="bg-yellow-500 hover:bg-yellow-600 text-[#81412f] font-bold px-4 py-2 rounded-lg transition-colors"
            >
              INICIAR SESIÓN
            </Link>
            
            <div className="flex items-center space-x-3 h-full">
              <Link 
                to="/registro-cliente" 
                className="bg-white hover:bg-gray-100 text-[#81412f] font-bold px-4 py-2 rounded-lg transition-colors"
              >
                CREAR CUENTA
              </Link>
            </div>
          </div>

          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#5a3927] pb-4 px-4">
          <div className="flex flex-col space-y-3 pt-2">
            <button
              onClick={() => scrollToSection('', true)}
              className={`py-2 px-3 rounded text-left ${location.pathname === '/' && !location.hash ? 'bg-[#81412f] text-yellow-200' : 'hover:bg-[#6a4232]'}`}
            >
              INICIO
            </button>
            <button
              onClick={() => scrollToSection('menu-section', true)}
              className={`py-2 px-3 rounded text-left ${location.hash === '#menu-section' ? 'bg-[#81412f] text-yellow-200' : 'hover:bg-[#6a4232]'}`}
            >
              MENÚ
            </button>
            <button
              onClick={() => scrollToSection('promociones-section', true)}
              className={`py-2 px-3 rounded text-left ${location.hash === '#promociones-section' ? 'bg-[#81412f] text-yellow-200' : 'hover:bg-[#6a4232]'}`}
            >
              PROMOCIONES
            </button>
            <Link 
              to="/login" 
              className="bg-yellow-500 hover:bg-yellow-600 text-[#81412f] font-bold py-2 px-3 rounded text-center transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              INICIAR SESIÓN
            </Link>
            <Link 
              to="/registro-cliente" 
              className="bg-white hover:bg-gray-100 text-[#81412f] font-bold py-2 px-3 rounded text-center transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              CREAR CUENTA
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default GuestNavbar;