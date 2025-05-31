import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CreatePromocion from '../CreatePromocion';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

// Mocks
vi.mock('../../api/axiosConfig');
vi.mock('../../context/AuthContext');

describe('CreatePromocion Component', () => {
  const mockOnClose = vi.fn();
  const mockOnCreate = vi.fn();
  const mockUserAdmin = { is_admin: true };
  const mockUserNotAdmin = { is_admin: false };
  const mockProductos = [
    { id: 1, nombre: 'Producto 1', precio: 10 },
    { id: 2, nombre: 'Producto 2', precio: 20 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUserAdmin });
    api.get.mockResolvedValue({ data: mockProductos });
    api.post.mockResolvedValue({ data: {} });
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <CreatePromocion onClose={mockOnClose} onCreate={mockOnCreate} />
      </MemoryRouter>
    );
  };

  it('1. Renderiza correctamente para usuarios admin', async () => {
    renderComponent();
    
    // Verificar que se cargan los productos
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/productos/');
    });

    expect(screen.getByText('Crear Nueva Promoción')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre:')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción:')).toBeInTheDocument();
    expect(screen.getByLabelText('Descuento (%):')).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha inicio:')).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha fin:')).toBeInTheDocument();
    expect(screen.getByText('Productos incluidos:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear Promoción' })).toBeInTheDocument();
  });

  it('2. Muestra error si el usuario no es admin', async () => {
    useAuth.mockReturnValue({ user: mockUserNotAdmin });
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Crear Promoción' }));

    await waitFor(() => {
      expect(screen.getByText('Solo los administradores pueden crear promociones')).toBeInTheDocument();
    });
  });

  it('3. Valida campos requeridos', async () => {
    renderComponent();

    // Esperar a que carguen los productos
    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Crear Promoción' }));

    await waitFor(() => {
      expect(screen.getByText('Por favor complete todos los campos correctamente')).toBeInTheDocument();
      expect(screen.getAllByText('Este campo es requerido').length).toBeGreaterThan(0);
      expect(screen.getByText('Seleccione al menos un producto')).toBeInTheDocument();
    });
  });

  it('4. Valida rango de descuento', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText('Descuento (%):'), { 
      target: { value: '0' } 
    });
    fireEvent.blur(screen.getByLabelText('Descuento (%):'));

    expect(await screen.findByText('El descuento debe ser entre 1% y 100%')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Descuento (%):'), { 
      target: { value: '101' } 
    });
    fireEvent.blur(screen.getByLabelText('Descuento (%):'));

    expect(await screen.findByText('El descuento debe ser entre 1% y 100%')).toBeInTheDocument();
  });

  it('5. Maneja selección de productos', async () => {
    renderComponent();

    // Esperar a que carguen los productos
    await waitFor(() => {
      expect(screen.getByText('Producto 1 ($10)')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText('Producto 1 ($10)');
    fireEvent.click(checkbox);
    
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it('6. Envía el formulario correctamente', async () => {
    const mockResponse = { 
      data: { 
        id: 1, 
        nombre: 'Promo Test',
        descuento: 20 
      } 
    };
    api.post.mockResolvedValue(mockResponse);

    renderComponent();

    // Esperar a que carguen los productos
    await waitFor(() => {
      expect(screen.getByText('Producto 1 ($10)')).toBeInTheDocument();
    });

    // Llenar formulario
    fireEvent.change(screen.getByLabelText('Nombre:'), { 
      target: { value: 'Promo Test' } 
    });
    fireEvent.change(screen.getByLabelText('Descripción:'), { 
      target: { value: 'Descripción de prueba' } 
    });
    fireEvent.change(screen.getByLabelText('Descuento (%):'), { 
      target: { value: '20' } 
    });
    fireEvent.change(screen.getByLabelText('Fecha fin:'), { 
      target: { value: '2025-12-31' } 
    });
    fireEvent.click(screen.getByLabelText('Producto 1 ($10)'));

    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: 'Crear Promoción' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/promociones/', {
        nombre: 'Promo Test',
        descripcion: 'Descripción de prueba',
        descuento: 20,
        productos: [1],
        fecha_inicio: expect.any(String),
        fecha_fin: '2025-12-31',
        estado: 'ACTIVA'
      });
      expect(mockOnCreate).toHaveBeenCalledWith(mockResponse.data);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('7. Maneja errores de la API', async () => {
    api.post.mockRejectedValue({ 
      response: { 
        data: { 
          message: 'Error de servidor' 
        } 
      } 
    });

    renderComponent();

    // Esperar a que carguen los productos
    await waitFor(() => {
      expect(screen.getByText('Producto 1 ($10)')).toBeInTheDocument();
    });

    // Llenar formulario mínimo
    fireEvent.change(screen.getByLabelText('Nombre:'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Descripción:'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Descuento (%):'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Fecha fin:'), { target: { value: '2025-12-31' } });
    fireEvent.click(screen.getByLabelText('Producto 1 ($10)'));

    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: 'Crear Promoción' }));

    await waitFor(() => {
      expect(screen.getByText('Error de servidor')).toBeInTheDocument();
    });
  });

  it('8. Cierra el modal al hacer clic en Cancelar', async () => {
    renderComponent();
    
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});