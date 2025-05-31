import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import GuestNavbar from './GuestNavbar';

// Mocks para react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(),
    useNavigate: vi.fn(),
  };
});

describe('GuestNavbar Component', () => {
  const mockNavigate = vi.fn();
  const mockLocation = {
    pathname: '/',
    hash: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useLocation.mockReturnValue(mockLocation);
    useNavigate.mockReturnValue(mockNavigate);
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <GuestNavbar />
      </MemoryRouter>
    );
  };

  it('1. Renderiza correctamente el navbar con los elementos principales', () => {
    renderComponent();
    
    // Logo y nombre
    expect(screen.getByText('🔥')).toBeInTheDocument();
    expect(screen.getByText('LA RECETA PERFECTA')).toBeInTheDocument();
    
    // Menú desktop
    expect(screen.getByText('INICIO')).toBeInTheDocument();
    expect(screen.getByText('MENÚ')).toBeInTheDocument();
    expect(screen.getByText('PROMOCIONES')).toBeInTheDocument();
    expect(screen.getByText('INICIAR SESIÓN')).toBeInTheDocument();
    expect(screen.getByText('CREAR CUENTA')).toBeInTheDocument();
    
    // Botón móvil
    expect(screen.getByRole('button', { name: /menu icon/i })).toBeInTheDocument();
  });

  it('2. Muestra el menú móvil cuando se hace clic en el botón de hamburguesa', () => {
    renderComponent();
    
    const menuButton = screen.getByRole('button', { name: /menu icon/i });
    fireEvent.click(menuButton);
    
    // Verificar que los elementos del menú móvil estén visibles
    expect(screen.getByText('INICIO')).toBeInTheDocument();
    expect(screen.getByText('MENÚ')).toBeInTheDocument();
    expect(screen.getByText('PROMOCIONES')).toBeInTheDocument();
    expect(screen.getByText('INICIAR SESIÓN')).toBeInTheDocument();
    expect(screen.getByText('CREAR CUENTA')).toBeInTheDocument();
  });

  it('3. Cierra el menú móvil cuando se hace clic en el botón de cerrar', () => {
    renderComponent();
    
    // Abrir menú
    const menuButton = screen.getByRole('button', { name: /menu icon/i });
    fireEvent.click(menuButton);
    
    // Verificar que está abierto
    expect(screen.getByText('CREAR CUENTA')).toBeInTheDocument();
    
    // Cerrar menú
    fireEvent.click(menuButton);
    
    // Verificar que está cerrado (solo debería estar el botón de hamburguesa)
    expect(screen.getByRole('button', { name: /menu icon/i })).toBeInTheDocument();
    expect(screen.queryByText('CREAR CUENTA')).not.toBeInTheDocument();
  });

  it('4. Navega al inicio cuando se hace clic en el logo', () => {
    renderComponent();
    
    const logoLink = screen.getByRole('link', { name: /🔥 la receta perfecta/i });
    fireEvent.click(logoLink);
    
    expect(mockNavigate).not.toHaveBeenCalled(); // No debería navegar si ya está en /
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('5. Resalta el elemento activo en el menú desktop', () => {
    // Configurar location para simular que estamos en la página de inicio
    useLocation.mockReturnValue({ pathname: '/', hash: '' });
    renderComponent();
    
    const inicioButton = screen.getByText('INICIO');
    expect(inicioButton).toHaveClass('font-bold');
    expect(inicioButton).toHaveClass('border-b-2');
  });

  it('6. Navega a la sección del menú cuando se hace clic en "MENÚ"', () => {
    renderComponent();
    
    const menuButton = screen.getByText('MENÚ');
    fireEvent.click(menuButton);
    
    expect(mockNavigate).not.toHaveBeenCalled(); // No debería navegar si ya está en /
    // Verificar que se llamó a scrollIntoView
    expect(document.getElementById('menu-section').scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth'
    });
  });

  it('7. Navega a login cuando se hace clic en "INICIAR SESIÓN"', () => {
    renderComponent();
    
    const loginButton = screen.getByText('INICIAR SESIÓN');
    fireEvent.click(loginButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('8. Navega a registro cuando se hace clic en "CREAR CUENTA"', () => {
    renderComponent();
    
    const registerButton = screen.getByText('CREAR CUENTA');
    fireEvent.click(registerButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/registro-cliente');
  });

  it('9. Cierra el menú móvil al hacer clic en un enlace', () => {
    renderComponent();
    
    // Abrir menú móvil
    const menuButton = screen.getByRole('button', { name: /menu icon/i });
    fireEvent.click(menuButton);
    
    // Hacer clic en un enlace
    const loginButton = screen.getByText('INICIAR SESIÓN');
    fireEvent.click(loginButton);
    
    // Verificar que el menú se cerró
    expect(screen.queryByText('CREAR CUENTA')).not.toBeInTheDocument();
  });

  it('10. Muestra correctamente el menú mobile cuando está en una ruta diferente', () => {
    useLocation.mockReturnValue({ pathname: '/otra-ruta', hash: '' });
    renderComponent();
    
    // Abrir menú móvil
    const menuButton = screen.getByRole('button', { name: /menu icon/i });
    fireEvent.click(menuButton);
    
    // Verificar que los elementos del menú están presentes
    expect(screen.getByText('INICIO')).toBeInTheDocument();
    expect(screen.getByText('MENÚ')).toBeInTheDocument();
    expect(screen.getByText('PROMOCIONES')).toBeInTheDocument();
  });
});

// Mock para window.scrollTo y Element.scrollIntoView
beforeAll(() => {
  window.scrollTo = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});