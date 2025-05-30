import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VehicleList from './VehicleList';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

// Mock de useAuth y api
jest.mock('../context/AuthContext');
jest.mock('../api/axiosConfig');

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
  // Configuración común
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { is_admin: true } });
    api.get.mockResolvedValue({ data: mockProducts });
  });

  // --- Prueba 1: Renderizado inicial ---
  it('debe mostrar un loading y luego la lista de productos', async () => {
    render(<VehicleList />);
    
    // Verificar loading inicial
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Esperar a que se carguen los productos
    await waitFor(() => {
      expect(screen.getByText('Hamburguesa')).toBeInTheDocument();
      expect(screen.getByText('Coca Cola')).toBeInTheDocument();
    });
  });

  // --- Prueba 2: Filtrado por categoría ---
  it('debe filtrar productos por categoría', async () => {
    render(<VehicleList />);
    
    await waitFor(() => {
      // Abrir dropdown de categorías
      const dropdown = screen.getByText('Todas las categorías');
      fireEvent.click(dropdown);
      
      // Seleccionar "Bebidas"
      const bebidasOption = screen.getByText('Bebidas');
      fireEvent.click(bebidasOption);
      
      // Verificar que solo aparece "Coca Cola"
      expect(screen.queryByText('Hamburguesa')).not.toBeInTheDocument();
      expect(screen.getByText('Coca Cola')).toBeInTheDocument();
    });
  });

  // --- Prueba 3: Búsqueda por nombre/descripción ---
  it('debe filtrar productos por búsqueda', async () => {
    render(<VehicleList />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Buscar productos...');
      fireEvent.change(searchInput, { target: { value: 'hamburguesa' } });
      
      expect(screen.getByText('Hamburguesa')).toBeInTheDocument();
      expect(screen.queryByText('Coca Cola')).not.toBeInTheDocument();
    });
  });

  // --- Prueba 4: Botón de eliminar (admin) ---
  it('debe mostrar botón de eliminar si el usuario es admin', async () => {
    render(<VehicleList />);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('🗑️ Eliminar');
      expect(deleteButtons.length).toBe(mockProducts.length);
    });
  });

  // --- Prueba 5: Ocultar acciones si no es admin ---
  it('no debe mostrar botones de editar/eliminar si el usuario no es admin', async () => {
    useAuth.mockReturnValue({ user: { is_admin: false } });
    render(<VehicleList />);
    
    await waitFor(() => {
      expect(screen.queryByText('✏️ Editar')).not.toBeInTheDocument();
      expect(screen.queryByText('🗑️ Eliminar')).not.toBeInTheDocument();
    });
  });

  // --- Prueba 6: Añadir producto ---
  it('debe abrir el modal de añadir producto al hacer clic', async () => {
    render(<VehicleList />);
    
    const addButton = screen.getByText('Añadir Producto');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('Añadir Vehículo')).toBeInTheDocument(); // Ajusta según tu modal
    });
  });
});