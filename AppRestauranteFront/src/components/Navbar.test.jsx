import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

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

describe('Navbar Component', () => {
  const mockLogout = vi.fn();
  const mockNavigate = vi.fn();
  const mockLocation = {
    pathname: '/',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useLocation.mockReturnValue(mockLocation);
    useNavigate.mockReturnValue(mockNavigate);
  });

  const renderWithUser = (user) => {
    useAuth.mockReturnValue({
      user,
      logout: mockLogout
    });
    
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
  };

  it('1. No renderiza nada cuando no hay usuario autenticado', () => {
    useAuth.mockReturnValue({ user: null });
    const { container } = render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('2. Renderiza correctamente para usuario admin', () => {
    const adminUser = {
      is_admin: true,
      username: 'admin',
      tipo_empleado: 'ADMINISTRADOR'
    };
    renderWithUser(adminUser);
    
    expect(screen.getByText('AppRestaurante')).toBeInTheDocument();
    expect(screen.getByText('Promociones')).toBeInTheDocument();
    expect(screen.getByText('Crear Empleado')).toBeInTheDocument();
    expect(screen.getByText('Productos')).toBeInTheDocument();
    expect(screen.getByText('ADMINISTRADOR')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('3. Renderiza correctamente para usuario mesero', () => {
    const meseroUser = {
      is_admin: false,
      username: 'mesero1',
      tipo_empleado: 'MESERO'
    };
    renderWithUser(meseroUser);
    
    expect(screen.getByText('AppRestaurante')).toBeInTheDocument();
    expect(screen.getByText('Promociones')).toBeInTheDocument();
    expect(screen.queryByText('Crear Empleado')).not.toBeInTheDocument();
    expect(screen.queryByText('Productos')).not.toBeInTheDocument();
    expect(screen.getByText('MESERO')).toBeInTheDocument();
    expect(screen.getByText('mesero1')).toBeInTheDocument();
  });

  it('4. Muestra el dropdown al hacer clic en el avatar', () => {
    renderWithUser({ is_admin: false, username: 'user', tipo_empleado: 'MESERO' });
    
    const avatarButton = screen.getByLabelText('Menú de usuario');
    fireEvent.click(avatarButton);
    
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
  });

  it('5. Cierra el dropdown al hacer clic fuera', () => {
    renderWithUser({ is_admin: false, username: 'user', tipo_empleado: 'MESERO' });
    
    // Abrir dropdown
    const avatarButton = screen.getByLabelText('Menú de usuario');
    fireEvent.click(avatarButton);
    
    // Clic fuera (en el overlay)
    const overlay = screen.getByRole('presentation');
    fireEvent.click(overlay);
    
    expect(screen.queryByText('Cerrar sesión')).not.toBeInTheDocument();
  });

  it('6. Cierra sesión correctamente', () => {
    renderWithUser({ is_admin: false, username: 'user', tipo_empleado: 'MESERO' });
    
    // Abrir dropdown
    const avatarButton = screen.getByLabelText('Menú de usuario');
    fireEvent.click(avatarButton);
    
    // Clic en cerrar sesión
    const logoutButton = screen.getByText('Cerrar sesión');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('7. Resalta la ruta activa', () => {
    useLocation.mockReturnValue({ pathname: '/promociones' });
    renderWithUser({ is_admin: false, username: 'user', tipo_empleado: 'MESERO' });
    
    const promocionesLink = screen.getByText('Promociones');
    expect(promocionesLink).toHaveClass('bg-amber-700');
    expect(promocionesLink).toHaveClass('text-white');
  });

  it('8. Muestra el avatar con la primera letra del username', () => {
    renderWithUser({ is_admin: false, username: 'testuser', tipo_empleado: 'MESERO' });
    
    const avatar = screen.getByText('T'); // Primera letra en mayúscula
    expect(avatar).toBeInTheDocument();
  });

  it('9. Muestra badge rojo para admin y azul para mesero', () => {
    // Test para admin
    const { rerender } = render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    
    useAuth.mockReturnValue({
      user: { is_admin: true, username: 'admin', tipo_empleado: 'ADMINISTRADOR' },
      logout: mockLogout
    });
    rerender(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    
    const adminBadge = screen.getByText('ADMINISTRADOR');
    expect(adminBadge).toHaveClass('bg-red-100');
    expect(adminBadge).toHaveClass('text-red-800');
    
    // Test para mesero
    useAuth.mockReturnValue({
      user: { is_admin: false, username: 'mesero', tipo_empleado: 'MESERO' },
      logout: mockLogout
    });
    rerender(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    
    const meseroBadge = screen.getByText('MESERO');
    expect(meseroBadge).toHaveClass('bg-blue-100');
    expect(meseroBadge).toHaveClass('text-blue-800');
  });

  it('10. Navega correctamente al hacer clic en el logo', () => {
    // Test para admin
    const adminUser = {
      is_admin: true,
      username: 'admin',
      tipo_empleado: 'ADMINISTRADOR'
    };
    renderWithUser(adminUser);
    
    const logo = screen.getByText('AppRestaurante').closest('a');
    fireEvent.click(logo);
    expect(mockNavigate).not.toHaveBeenCalled(); // Usa Link, no navigate
    
    // Test para mesero
    const meseroUser = {
      is_admin: false,
      username: 'mesero',
      tipo_empleado: 'MESERO'
    };
    renderWithUser(meseroUser);
    
    const logoMesero = screen.getByText('AppRestaurante').closest('a');
    fireEvent.click(logoMesero);
    expect(mockNavigate).not.toHaveBeenCalled(); // Usa Link, no navigate
  });
});