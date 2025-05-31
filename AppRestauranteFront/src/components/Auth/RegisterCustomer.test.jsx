import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterCustomer from './RegisterCustomer';
import { useAuth } from '../../context/AuthContext';

// Mocks
vi.mock('../../context/AuthContext');

describe('RegisterCustomer Component', () => {
  const mockRegister = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      registerCustomer: mockRegister
    });
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <RegisterCustomer />
      </MemoryRouter>
    );
  };

  it('1. Renderiza correctamente el formulario de registro', () => {
    renderComponent();
    
    expect(screen.getByText('Registro de cliente')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre de usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrarse' })).toBeInTheDocument();
  });

  it('2. Muestra estado de carga al enviar el formulario', async () => {
    mockRegister.mockImplementation(() => new Promise(() => {}));
    renderComponent();
    
    fireEvent.change(screen.getByLabelText('Nombre de usuario'), { 
      target: { value: 'testuser' } 
    });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { 
      target: { value: 'password123' } 
    });

    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));
    
    await waitFor(() => {
      expect(screen.getByText('Registrando...')).toBeInTheDocument();
    });
  });

  it('3. Maneja registro exitoso', async () => {
    mockRegister.mockResolvedValue({});
    renderComponent();
    
    fireEvent.change(screen.getByLabelText('Nombre de usuario'), { 
      target: { value: 'testuser' } 
    });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { 
      target: { value: 'password123' } 
    });

    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));
    
    await waitFor(() => {
      expect(screen.getByText('¡Registro exitoso!')).toBeInTheDocument();
      expect(screen.getByText('Redirigiendo al login...')).toBeInTheDocument();
    });
  });

  it('4. Muestra errores de registro', async () => {
    const errorMessage = 'El correo ya está registrado';
    mockRegister.mockRejectedValue({ 
      response: { 
        data: { 
          message: errorMessage 
        } 
      } 
    });
    renderComponent();
    
    fireEvent.change(screen.getByLabelText('Nombre de usuario'), { 
      target: { value: 'testuser' } 
    });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { 
      target: { value: 'password123' } 
    });

    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('5. Valida campos requeridos', async () => {
    renderComponent();
    
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));
    
    await waitFor(() => {
      expect(screen.getByLabelText('Nombre de usuario')).toHaveAttribute('required');
      expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('required');
      expect(screen.getByLabelText('Contraseña')).toHaveAttribute('required');
    });
  });

  it('6. Deshabilita el botón durante el registro', async () => {
    mockRegister.mockImplementation(() => new Promise(() => {}));
    renderComponent();
    
    fireEvent.change(screen.getByLabelText('Nombre de usuario'), { 
      target: { value: 'testuser' } 
    });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { 
      target: { value: 'password123' } 
    });

    const submitButton = screen.getByRole('button', { name: 'Registrarse' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass('opacity-50');
      expect(submitButton).toHaveClass('cursor-not-allowed');
    });
  });

  it('7. Muestra spinner durante el registro', async () => {
    mockRegister.mockImplementation(() => new Promise(() => {}));
    renderComponent();
    
    fireEvent.change(screen.getByLabelText('Nombre de usuario'), { 
      target: { value: 'testuser' } 
    });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { 
      target: { value: 'password123' } 
    });

    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));
    
    await waitFor(() => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
  });
});