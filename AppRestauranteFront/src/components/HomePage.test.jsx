import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from '../api/axiosConfig';
import HomePage from './HomePage';
import { MemoryRouter } from 'react-router-dom';

// Mocks
vi.mock('../api/axiosConfig');

describe('HomePage Component', () => {
  const mockPromociones = [
    { id: 1, nombre: 'Promo 1', descripcion: 'Descripción promo 1', precio: 100, estado: 'ACTIVA' },
    { id: 2, nombre: 'Promo 2', descripcion: 'Descripción promo 2', precio: 150, estado: 'ACTIVA' }
  ];

  const mockProductos = [
    { id: 1, nombre: 'Producto 1', descripcion: 'Descripción 1', precio: 50, categoria: 'PLATO_PRINCIPAL' },
    { id: 2, nombre: 'Producto 2', descripcion: 'Descripción 2', precio: 60, categoria: 'ENTRADA' },
    { id: 3, nombre: 'Bebida 1', descripcion: 'Descripción bebida', precio: 20, categoria: 'BEBIDA' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockImplementation((url) => {
      if (url.includes('/promociones')) {
        return Promise.resolve({ data: mockPromociones });
      } else if (url.includes('/productos')) {
        return Promise.resolve({ data: mockProductos });
      }
      return Promise.reject(new Error('URL no mockeada'));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
  };

  it('1. Renderiza el estado de carga inicial', async () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    renderComponent();
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('2. Muestra error cuando falla la carga de datos', async () => {
    axios.get.mockRejectedValue(new Error('Error de red'));
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Error al cargar los datos/i)).toBeInTheDocument();
    });
  });

  it('3. Carga y muestra promociones correctamente', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Promociones')).toBeInTheDocument();
      expect(screen.getByText('Promo 1')).toBeInTheDocument();
      expect(screen.getByText('Promo 2')).toBeInTheDocument();
    });
  });

  it('4. Carga y muestra productos correctamente', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Nuestro Menú')).toBeInTheDocument();
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
      expect(screen.getByText('Producto 2')).toBeInTheDocument();
    });
  });

  it('5. Filtra productos por categoría', async () => {
    renderComponent();
    
    await waitFor(() => {
      // Esperar a que los productos se carguen
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
    });

    // Seleccionar categoría PLATO_PRINCIPAL
    const select = screen.getByLabelText('Categoría');
    fireEvent.change(select, { target: { value: 'PLATO_PRINCIPAL' } });
    
    await waitFor(() => {
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
      expect(screen.queryByText('Producto 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Bebida 1')).not.toBeInTheDocument();
    });
  });

  it('6. Filtra productos por término de búsqueda', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
    });

    // Buscar por término "bebida"
    const searchInput = screen.getByPlaceholderText('Nombre, descripción...');
    fireEvent.change(searchInput, { target: { value: 'bebida' } });
    
    await waitFor(() => {
      expect(screen.getByText('Bebida 1')).toBeInTheDocument();
      expect(screen.queryByText('Producto 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Producto 2')).not.toBeInTheDocument();
    });
  });

  it('7. Muestra mensaje cuando no hay promociones', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/promociones')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: mockProductos });
    });
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/No hay promociones disponibles/i)).toBeInTheDocument();
    });
  });

  it('8. Muestra mensaje cuando no hay productos con los filtros aplicados', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
    });

    // Aplicar filtro que no coincida con ningún producto
    const searchInput = screen.getByPlaceholderText('Nombre, descripción...');
    fireEvent.change(searchInput, { target: { value: 'xxxxxxx' } });
    
    await waitFor(() => {
      expect(screen.getByText(/No se encontraron productos/i)).toBeInTheDocument();
    });
  });

  it('9. Limpia los filtros correctamente', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
    });

    // Aplicar filtros
    const select = screen.getByLabelText('Categoría');
    fireEvent.change(select, { target: { value: 'PLATO_PRINCIPAL' } });
    
    const searchInput = screen.getByPlaceholderText('Nombre, descripción...');
    fireEvent.change(searchInput, { target: { value: 'producto' } });
    
    // Verificar que los filtros están aplicados
    await waitFor(() => {
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
      expect(screen.queryByText('Producto 2')).not.toBeInTheDocument();
    });

    // Limpiar filtros
    const clearButton = screen.getByText(/Limpiar filtros/i);
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      // Todos los productos deberían estar visibles nuevamente
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
      expect(screen.getByText('Producto 2')).toBeInTheDocument();
      expect(screen.getByText('Bebida 1')).toBeInTheDocument();
    });
  });

  it('10. Muestra solo 8 productos inicialmente', async () => {
    // Crear más de 8 productos para la prueba
    const muchosProductos = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      nombre: `Producto ${i + 1}`,
      descripcion: `Descripción ${i + 1}`,
      precio: 50 + i,
      categoria: 'PLATO_PRINCIPAL'
    }));
    
    axios.get.mockImplementation((url) => {
      if (url.includes('/promociones')) {
        return Promise.resolve({ data: mockPromociones });
      } else if (url.includes('/productos')) {
        return Promise.resolve({ data: muchosProductos });
      }
      return Promise.reject(new Error('URL no mockeada'));
    });
    
    renderComponent();
    
    await waitFor(() => {
      // Verificar que solo se muestran 8 productos
      const productosCards = screen.getAllByText(/Producto \d+/);
      expect(productosCards.length).toBe(8);
    });
  });
});