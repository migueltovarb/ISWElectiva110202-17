// src/components/VehicleList.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VehicleList from './VehicleList';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

// Mocks
vi.mock('../api/axiosConfig', () => ({
  default: {
    get: vi.fn()
  }
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Datos de prueba
const mockProducts = [
  {
    id: 1,
    nombre: 'Hamburguesa',
    categoria: 'PLATO_PRINCIPAL',
    categoria_nombre: 'Platos Principales',
    descripcion: 'Deliciosa hamburguesa con queso',
    precio: 15000,
    estado: 'DISPONIBLE',
    estado_nombre: 'Disponible'
  },
  {
    id: 2,
    nombre: 'Coca Cola',
    categoria: 'BEBIDA',
    categoria_nombre: 'Bebidas',
    descripcion: 'Refresco de 500ml',
    precio: 5000,
    estado: 'AGOTADO',
    estado_nombre: 'Agotado'
  }
];

describe('<VehicleList />', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { is_admin: true } });
    api.get.mockResolvedValue({ data: mockProducts });
  });

  it('1. Muestra loading y luego la lista de productos', async () => {
    render(<VehicleList />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Hamburguesa')).toBeInTheDocument();
      expect(screen.getByText('Coca Cola')).toBeInTheDocument();
    });
  });

  it('2. Filtra productos por categoría', async () => {
    render(<VehicleList />);

    await waitFor(() => {
      const dropdown = screen.getByText('Todas las categorías');
      fireEvent.click(dropdown);

      const bebidasOption = screen.getByText('Bebidas');
      fireEvent.click(bebidasOption);

      expect(screen.queryByText('Hamburguesa')).not.toBeInTheDocument();
      expect(screen.getByText('Coca Cola')).toBeInTheDocument();
    });
  });

  it('3. Filtra productos por búsqueda', async () => {
    render(<VehicleList />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Buscar productos...');
      fireEvent.change(searchInput, { target: { value: 'hamburguesa' } });

      expect(screen.getByText('Hamburguesa')).toBeInTheDocument();
      expect(screen.queryByText('Coca Cola')).not.toBeInTheDocument();
    });
  });

  it('4. Muestra botón de eliminar para admin', async () => {
    render(<VehicleList />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('🗑️ Eliminar');
      expect(deleteButtons.length).toBe(mockProducts.length);
    });
  });

  it('5. No muestra botones de acciones si no es admin', async () => {
    useAuth.mockReturnValue({ user: { is_admin: false } });
    render(<VehicleList />);

    await waitFor(() => {
      expect(screen.queryByText('✏️ Editar')).not.toBeInTheDocument();
      expect(screen.queryByText('🗑️ Eliminar')).not.toBeInTheDocument();
    });
  });

  it('6. Abre el modal de añadir producto al hacer clic', async () => {
    render(<VehicleList />);

    const addButton = screen.getByText('Añadir Producto');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Añadir Vehículo')).toBeInTheDocument(); // Ajusta si el modal tiene otro título
    });
  });
});
