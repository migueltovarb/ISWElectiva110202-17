import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditVehicle from './EditVehicle';
import api from '../api/axiosConfig';

// Mock de la API
vi.mock('../api/axiosConfig');

describe('EditVehicle Component', () => {
  const mockVehicle = {
    id: 1,
    categoria: 'PLATO_PRINCIPAL',
    nombre: 'Producto de prueba',
    descripcion: 'Descripción de prueba',
    precio: 10000,
    estado: 'DISPONIBLE'
  };

  const mockOnClose = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <EditVehicle 
        vehicle={mockVehicle} 
        onClose={mockOnClose} 
        onEdit={mockOnEdit} 
      />
    );
  };

  it('1. Renderiza correctamente el formulario de edición', () => {
    renderComponent();
    
    expect(screen.getByText('Editar Producto')).toBeInTheDocument();
    expect(screen.getByLabelText('Categoría')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
    expect(screen.getByLabelText('Precio')).toBeInTheDocument();
    expect(screen.getByLabelText('Estado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar Cambios' })).toBeInTheDocument();
  });

  it('2. Muestra los valores iniciales del vehículo', () => {
    renderComponent();
    
    expect(screen.getByLabelText('Nombre')).toHaveValue(mockVehicle.nombre);
    expect(screen.getByLabelText('Descripción')).toHaveValue(mockVehicle.descripcion);
    expect(screen.getByLabelText('Precio')).toHaveValue(mockVehicle.precio);
  });

  it('3. Muestra estado de carga al enviar el formulario', async () => {
    api.put.mockImplementation(() => new Promise(() => {}));
    renderComponent();
    
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Cambios' }));
    
    await waitFor(() => {
      expect(screen.getByText('Guardando...')).toBeInTheDocument();
    });
  });

  it('4. Maneja edición exitosa', async () => {
    const updatedData = {
      ...mockVehicle,
      nombre: 'Producto actualizado',
      precio: 15000
    };
    
    api.put.mockResolvedValue({ data: updatedData });
    renderComponent();
    
    fireEvent.change(screen.getByLabelText('Nombre'), { 
      target: { value: 'Producto actualizado' } 
    });
    fireEvent.change(screen.getByLabelText('Precio'), { 
      target: { value: 15000 } 
    });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Cambios' }));
    
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(`/productos/${mockVehicle.id}/?_=${expect.any(Number)}`, {
        categoria: mockVehicle.categoria,
        nombre: 'Producto actualizado',
        descripcion: mockVehicle.descripcion,
        precio: 15000,
        estado: mockVehicle.estado
      });
      expect(mockOnEdit).toHaveBeenCalledWith(updatedData);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('5. Muestra errores del servidor', async () => {
    const errorMessage = 'Error al actualizar el producto';
    api.put.mockRejectedValue({ 
      response: { 
        data: { 
          message: errorMessage 
        } 
      } 
    });
    renderComponent();
    
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Cambios' }));
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('6. Valida campos requeridos', async () => {
    renderComponent();
    
    // Limpiar campos requeridos
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Precio'), { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Cambios' }));
    
    await waitFor(() => {
      expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
      expect(screen.getByText('La descripción es requerida')).toBeInTheDocument();
      expect(screen.getByText('El precio es requerido')).toBeInTheDocument();
    });
  });

  it('7. Valida formato del precio', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByLabelText('Precio'), { target: { value: 'no-numero' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Cambios' }));
    
    await waitFor(() => {
      expect(screen.getByText('Debe ser un número válido')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Precio'), { target: { value: '-100' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Cambios' }));
    
    await waitFor(() => {
      expect(screen.getByText('El precio debe ser mayor a 0')).toBeInTheDocument();
    });
  });

  it('8. Deshabilita el botón durante el envío', async () => {
    api.put.mockImplementation(() => new Promise(() => {}));
    renderComponent();
    
    const submitButton = screen.getByRole('button', { name: 'Guardar Cambios' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Guardando...');
    });
  });

  it('9. Cierra el formulario al hacer clic en Cancelar', () => {
    renderComponent();
    
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('10. Maneja el caso cuando la API responde con status 200 pero sin datos', async () => {
    api.put.mockResolvedValue({ status: 200, data: null });
    renderComponent();
    
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Cambios' }));
    
    await waitFor(() => {
        expect(screen.getByText((content, element) =>
            element.textContent === 'Cambios guardados. Refresque para ver actualizaciones.'
        )).toBeInTheDocument();
    });

  });
});