// src/components/Auth/CreateEmployee.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CreateEmployee from './CreateEmployee';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

// Mocks
vi.mock('../../api/axiosConfig', () => ({
  default: {
    post: vi.fn()
  }
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('CreateEmployee Component', () => {
  const mockNavigate = vi.fn();
  const mockUserAdmin = { is_admin: true };

  beforeEach(() => {
    useAuth.mockReturnValue({ user: mockUserAdmin });
    api.post.mockResolvedValue({ data: {} });
    
    // Mock de localStorage
    global.localStorage = {
      getItem: vi.fn(() => 'fake-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
  });

  it('1. No renderiza si el usuario no es admin', () => {
    useAuth.mockReturnValue({ user: { is_admin: false } });
    
    const { container } = render(
      <MemoryRouter>
        <CreateEmployee />
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('2. Renderiza correctamente para usuarios admin', () => {
    render(
      <MemoryRouter>
        <CreateEmployee />
      </MemoryRouter>
    );

    expect(screen.getByText('Crear Nuevo Empleado')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre de usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de empleado')).toBeInTheDocument();
    expect(screen.getByLabelText('Teléfono (opcional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear Empleado' })).toBeInTheDocument();
  });

  it('3. Maneja cambios en los inputs correctamente', async () => {
    render(
      <MemoryRouter>
        <CreateEmployee />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText('Nombre de usuario');
    fireEvent.change(usernameInput, { target: { value: 'nuevoUsuario' } });
    expect(usernameInput.value).toBe('nuevoUsuario');
  });

  it('4. Envía el formulario correctamente', async () => {
    render(
      <MemoryRouter>
        <CreateEmployee />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Nombre de usuario'), { 
      target: { value: 'testuser' } 
    });
    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { 
      target: { value: 'password123' } 
    });

    fireEvent.click(screen.getByRole('button', { name: 'Crear Empleado' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
  });

  it('5. Maneja errores al enviar el formulario', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    api.post.mockRejectedValue(new Error('Error de API'));

    render(
      <MemoryRouter>
        <CreateEmployee />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Crear Empleado' }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('6. Valida campos requeridos', async () => {
    render(
      <MemoryRouter>
        <CreateEmployee />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: 'Crear Empleado' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Nombre de usuario')).toHaveAttribute('required');
      expect(screen.getByLabelText('Email')).toHaveAttribute('required');
      expect(screen.getByLabelText('Contraseña')).toHaveAttribute('required');
    });
  });
});