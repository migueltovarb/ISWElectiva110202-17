import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddVehicle from '../AddVehicle';
import api from '../../../api/axiosConfig';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../api/axiosConfig');

describe('AddVehicle component', () => {
  const mockOnClose = vi.fn();
  const mockOnAdd = vi.fn();

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <AddVehicle onClose={mockOnClose} onAdd={mockOnAdd} />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza correctamente los campos del formulario', () => {
    renderComponent();

    expect(screen.getByText(/Agregar Producto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Precio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Categoría/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
  });

  it('muestra errores si se intenta guardar sin llenar los campos', async () => {
    renderComponent();

    fireEvent.click(screen.getByText(/Guardar/i));

    expect(await screen.findByText(/El nombre es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/La descripción es requerida/i)).toBeInTheDocument();
    expect(screen.getByText(/El precio es requerido/i)).toBeInTheDocument();
  });

  it('valida que el precio sea mayor a cero', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Vehículo 1' } });
    fireEvent.change(screen.getByLabelText(/Descripción/i), { target: { value: 'Muy bueno' } });
    fireEvent.change(screen.getByLabelText(/Precio/i), { target: { value: '-10' } });

    fireEvent.click(screen.getByText(/Guardar/i));

    expect(await screen.findByText(/El precio debe ser mayor a 0/i)).toBeInTheDocument();
  });

  it('envía los datos correctamente al hacer submit', async () => {
    const mockResponse = {
      data: { id: 1, nombre: 'Vehículo 1' }
    };

    api.post.mockResolvedValueOnce(mockResponse);

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Vehículo 1' } });
    fireEvent.change(screen.getByLabelText(/Descripción/i), { target: { value: 'Rápido y cómodo' } });
    fireEvent.change(screen.getByLabelText(/Precio/i), { target: { value: '10000' } });

    fireEvent.click(screen.getByText(/Guardar/i));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(mockOnAdd).toHaveBeenCalledWith(mockResponse.data);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('muestra error si la API responde con error', async () => {
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Error al guardar producto'
        }
      }
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Producto fallido' } });
    fireEvent.change(screen.getByLabelText(/Descripción/i), { target: { value: 'Error test' } });
    fireEvent.change(screen.getByLabelText(/Precio/i), { target: { value: '20' } });

    fireEvent.click(screen.getByText(/Guardar/i));

    expect(await screen.findByText(/Error al guardar producto/i)).toBeInTheDocument();
  });

  it('cierra el modal correctamente al hacer clic en "Cancelar"', () => {
    renderComponent();

    fireEvent.click(screen.getByText(/Cancelar/i));

    expect(mockOnClose).toHaveBeenCalled();
  });
});
