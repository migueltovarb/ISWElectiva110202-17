import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterCustomer from './RegisterCustomer';
import { useAuth } from '../../context/AuthContext';

// Mocks
vi.mock('../../context/AuthContext');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

describe('RegisterCustomer Component', () => {
  const mockRegisterCustomer = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      registerCustomer: mockRegisterCustomer
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
    expect(screen.getByRole('button', { name: /Registrarse/i })).toBeInTheDocument();
    expect(screen.getByText('¿Ya tienes una cuenta?')).toBeInTheDocument();
  });

  it('2. Muestra estado de carga al enviar el formulario', async () => {
    mockRegisterCustomer.mockImplementation(() => new Promise(() => {}));
    renderComponent();
    
    // Llenar formulario
    fireEvent.change(screen.getByLabelText('Nombre de usuario'), { 
      target: { value: 'testuser' } 
    });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { 
      target: { value: 'password123' } 
    });

    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Registrando...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  it('3. Maneja registro exitoso correctamente', async () => {
    mockRegisterCustomer.mockResolvedValue({});
    renderComponent();
    
    // Llenar formulario
    fireEvent.change(screen.getByLabelText('Nombre de usuario'), { 
      target: { value: 'testuser' } 
    });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { 
      target: { value: 'password123' } 
    });

    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));
    
    await waitFor(() => {
      expect(screen.getByText('¡Registro exitoso!')).toBeInTheDocument();
      expect(screen.getByText('Redirigiendo al login...')).toBeInTheDocument();
    });
  });

  it('4. Muestra mensajes de error cuando falla el registro', async () => {
    const errorMessage = 'El correo ya está registrado';
    mockRegisterCustomer.mockRejectedValue({ 
      response: { 
        data: { 
          message: errorMessage 
        } 
      } 
    });
    renderComponent();
    
    // Llenar formulario
    fireEvent.change(screen.getByLabelText('Nombre de usuario'), { 
      target: { value: 'testuser' } 
    });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { 
      target: { value: 'password123' } 
    });

    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('5. Valida que los campos sean requeridos', async () => {
    renderComponent();
    
    // Enviar formulario vacío
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));
    
    await waitFor(() => {
      expect(screen.getByLabelText('Nombre de usuario')).toHaveAttribute('required');
      expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('required');
      expect(screen.getByLabelText('Contraseña')).toHaveAttribute('required');
    });
  });

  it('6. Deshabilita el botón durante el registro', async () => {
    mockRegisterCustomer.mockImplementation(() => new Promise(() => {}));
    renderComponent();
    
    // Llenar formulario
    fireEvent.change(screen.getByLabelText('Nombre de usuario'), { 
      target: { value: 'testuser' } 
    });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { 
      target: { value: 'password123' } 
    });

    const submitButton = screen.getByRole('button', { name: /Registrarse/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass('opacity-50');
      expect(submitButton).toHaveClass('cursor-not-allowed');
    });
  });

  it('7. Muestra el spinner de carga durante el registro', async () => {
    mockRegisterCustomer.mockImplementation(() => new Promise(() => {}));
    renderComponent();
    
    // Llenar formulario
    fireEvent.change(screen.getByLabelText('Nombre de usuario'), { 
      target: { value: 'testuser' } 
    });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { 
      target: { value: 'password123' } 
    });

    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });
});