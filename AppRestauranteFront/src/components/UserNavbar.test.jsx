import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserNavbar from './UserNavbar';

// Mocks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(),
    useNavigate: vi.fn(),
  };
});

vi.mock('../context/AuthContext');

describe('UserNavbar Component', () => {
  const mockUser = {
    username: 'testuser',
    is_admin: false
  };
  const mockLogout = vi.fn();
  const mockNavigate = vi.fn();
  const mockLocation = {
    pathname: '/',
    hash: ''
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useLocation.mockReturnValue(mockLocation);
    useNavigate.mockReturnValue(mockNavigate);
    useAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout
    });
    window.scrollTo = vi.fn();
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <UserNavbar />
      </MemoryRouter>
    );
  };

  it('1. Renderiza correctamente el navbar con elementos básicos', () => {
    renderComponent();
    
    expect(screen.getByText('🔥')).toBeInTheDocument();
    expect(screen.getByText('LA RECETA PERFECTA')).toBeInTheDocument();
    expect(screen.getByText('INICIO')).toBeInTheDocument();
    expect(screen.getByText('MENÚ')).toBeInTheDocument();
    expect(screen.getByText('PROMOCIONES')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('2. Muestra el menú móvil al hacer clic en el botón', () => {
    renderComponent();
    
    const menuButton = screen.getByLabelText('Abrir menú');
    fireEvent.click(menuButton);
    
    expect(screen.getByText('Mi Cuenta')).toBeInTheDocument();
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
  });

  it('3. Cierra sesión correctamente', () => {
    renderComponent();
    
    // Abrir menú móvil
    const menuButton = screen.getByLabelText('Abrir menú');
    fireEvent.click(menuButton);
    
    // Hacer clic en cerrar sesión
    const logoutButton = screen.getByText('Cerrar Sesión');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('4. Muestra el dropdown de usuario al hacer clic en el avatar', () => {
    renderComponent();
    
    const avatarButton = screen.getByLabelText('Abrir menú usuario');
    fireEvent.click(avatarButton);
    
    expect(screen.getByText('Mi Cuenta')).toBeInTheDocument();
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
  });

  it('5. Navega a la sección correcta al hacer clic en los enlaces', () => {
    renderComponent();
    
    const menuButton = screen.getByText('MENÚ');
    fireEvent.click(menuButton);
    
    expect(mockNavigate).not.toHaveBeenCalled(); // Usa scroll en lugar de navigate
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it('6. Resalta la ruta activa', () => {
    useLocation.mockReturnValue({ pathname: '/', hash: '#menu-section' });
    renderComponent();
    
    const menuLink = screen.getByText('MENÚ');
    expect(menuLink).toHaveClass('text-amber-300');
    expect(menuLink).toHaveClass('border-b-2');
  });

  it('7. Muestra botón de login cuando no hay usuario', () => {
    useAuth.mockReturnValue({ user: null, logout: mockLogout });
    renderComponent();
    
    // Abrir menú móvil
    const menuButton = screen.getByLabelText('Abrir menú');
    fireEvent.click(menuButton);
    
    expect(screen.getByText('INICIAR SESIÓN')).toBeInTheDocument();
    expect(screen.queryByText('Mi Cuenta')).not.toBeInTheDocument();
  });

  it('8. Cierra el menú móvil al navegar', () => {
    renderComponent();
    
    // Abrir menú móvil
    const menuButton = screen.getByLabelText('Abrir menú');
    fireEvent.click(menuButton);
    
    // Hacer clic en un enlace
    const accountLink = screen.getByText('Mi Cuenta');
    fireEvent.click(accountLink);
    
    expect(screen.queryByText('Mi Cuenta')).not.toBeInTheDocument();
  });

  it('9. Muestra la primera letra del nombre de usuario en el avatar', () => {
    renderComponent();
    
    const avatar = screen.getByText('T'); // Primera letra de 'testuser'
    expect(avatar).toBeInTheDocument();
  });

  it('10. Cierra el dropdown al hacer clic fuera', () => {
    renderComponent();
    
    // Abrir dropdown
    const avatarButton = screen.getByLabelText('Abrir menú usuario');
    fireEvent.click(avatarButton);
    
    // Hacer clic en otro lugar (simulado)
    fireEvent.click(document.body);
    
    expect(screen.queryByText('Mi Cuenta')).not.toBeInTheDocument();
  });

  it('11. Navega al inicio al hacer clic en el logo', () => {
    renderComponent();
    
    const logo = screen.getByLabelText('Ir al inicio');
    fireEvent.click(logo);
    
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('12. Muestra icono de usuario cuando no hay nombre', () => {
    useAuth.mockReturnValue({ user: { username: null }, logout: mockLogout });
    renderComponent();
    
    expect(screen.getByText('👤')).toBeInTheDocument();
    expect(screen.getByText('Cuenta')).toBeInTheDocument();
  });
});