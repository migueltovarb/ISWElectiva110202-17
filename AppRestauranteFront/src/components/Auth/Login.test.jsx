import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { AuthContext } from '../../../context/AuthContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login component', () => {
  const loginEmployee = vi.fn();
  const loginCustomer = vi.fn();

  const renderComponent = () => {
    render(
      <AuthContext.Provider value={{ loginEmployee, loginCustomer }}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('se renderiza correctamente', () => {
    renderComponent();
    expect(screen.getByText(/INICIAR SESIÓN/i)).toBeInTheDocument();
    expect(screen.getByText(/Cliente/)).toBeInTheDocument();
    expect(screen.getByText(/Personal/)).toBeInTheDocument();
  });

  it('permite cambiar entre personal y cliente', () => {
    renderComponent();
    const clienteBtn = screen.getByText('Cliente');
    fireEvent.click(clienteBtn);
    expect(screen.getByText(/Regístrate aquí/)).toBeInTheDocument();
  });

  it('actualiza campos de usuario y contraseña', () => {
    renderComponent();
    const usernameInput = screen.getByPlaceholderText(/Ingrese su usuario/);
    const passwordInput = screen.getByPlaceholderText(/Ingrese su contraseña/);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'secretpass' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('secretpass');
  });

  it('hace login como empleado y navega correctamente', async () => {
    loginEmployee.mockResolvedValueOnce({ is_admin: true });
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Ingrese su usuario/), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText(/Ingrese su contraseña/), { target: { value: 'adminpass' } });
    fireEvent.click(screen.getByRole('button', { name: /INGRESAR COMO PERSONAL/i }));

    await waitFor(() => {
      expect(loginEmployee).toHaveBeenCalledWith('admin', 'adminpass');
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('muestra mensaje de error al fallar login', async () => {
    loginEmployee.mockRejectedValueOnce({
      response: { data: { detail: 'Credenciales incorrectas' } },
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Ingrese su usuario/), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByPlaceholderText(/Ingrese su contraseña/), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /INGRESAR COMO PERSONAL/i }));

    await waitFor(() => {
      expect(screen.getByText(/Credenciales incorrectas/i)).toBeInTheDocument();
    });
  });
});
