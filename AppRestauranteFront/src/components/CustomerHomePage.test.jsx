import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CustomerHomePage from './CustomerHomePage';
import axios from '../api/axiosConfig';

// Mocks
vi.mock('../api/axiosConfig');

describe('CustomerHomePage Component', () => {
  const mockPromociones = [
    { id: 1, nombre: 'Promo 1', descuento: 20, estado: 'ACTIVA' },
    { id: 2, nombre: 'Promo 2', descuento: 15, estado: 'ACTIVA' }
  ];

  const mockProductos = [
    { id: 1, nombre: 'Producto 1', categoria: 'PLATO_PRINCIPAL', precio: 10 },
    { id: 2, nombre: 'Producto 2', categoria: 'BEBIDA', precio: 5 },
    { id: 3, nombre: 'Producto 3', categoria: 'POSTRE', precio: 8 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockImplementation((url) => {
      if (url === '/promociones/?estado=ACTIVA') {
        return Promise.resolve({ data: mockPromociones });
      }
      if (url === '/productos/') {
        return Promise.resolve({ data: mockProductos });
      }
      return Promise.reject(new Error('URL no mockeada'));
    });
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <CustomerHomePage />
      </MemoryRouter>
    );
  };

  it('1. Renderiza correctamente en estado de carga', async () => {
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

  it('3. Carga y muestra promociones y productos correctamente', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('¡BIENVENIDO DE VUELTA!')).toBeInTheDocument();
      expect(screen.getByText('Tus Promociones')).toBeInTheDocument();
      expect(screen.getByText('Nuestro Menú')).toBeInTheDocument();
    });

    expect(screen.getByText('Promo 1')).toBeInTheDocument();
    expect(screen.getByText('Promo 2')).toBeInTheDocument();

    expect(screen.getByText('Producto 1')).toBeInTheDocument();
    expect(screen.getByText('Producto 2')).toBeInTheDocument();
  });

  it('4. Filtra productos por categoría', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Categoría'), { 
      target: { value: 'BEBIDA' } 
    });

    await waitFor(() => {
      expect(screen.queryByText('Producto 1')).not.toBeInTheDocument(); // No debería aparecer
      expect(screen.getByText('Producto 2')).toBeInTheDocument(); // Debería aparecer
    });
  });

  it('5. Filtra productos por término de búsqueda', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Nombre, descripción...'), { 
      target: { value: 'bebida' } 
    });

    await waitFor(() => {
      expect(screen.queryByText('Producto 1')).not.toBeInTheDocument();
      expect(screen.getByText('Producto 2')).toBeInTheDocument();
    });
  });

  it('6. Limpia los filtros correctamente', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Categoría'), { 
      target: { value: 'BEBIDA' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Nombre, descripción...'), { 
      target: { value: 'bebida' } 
    });

    const limpiarBtn = screen.getByText('Limpiar filtros');
    expect(limpiarBtn).toBeInTheDocument();

    fireEvent.click(limpiarBtn);

    await waitFor(() => {
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
      expect(screen.getByText('Producto 2')).toBeInTheDocument();
      expect(screen.getByText('Producto 3')).toBeInTheDocument();
    });
  });

  it('7. Muestra mensaje cuando no hay promociones', async () => {
    axios.get.mockImplementation((url) => {
      if (url === '/promociones/?estado=ACTIVA') {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: mockProductos });
    });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('No hay promociones disponibles')).toBeInTheDocument();
    });
  });

  it('8. Muestra mensaje cuando no hay productos con los filtros aplicados', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Nombre, descripción...'), { 
      target: { value: 'xxxxxxx' } 
    });

    await waitFor(() => {
      expect(screen.getByText('No se encontraron productos con los filtros aplicados')).toBeInTheDocument();
    });
  });
});