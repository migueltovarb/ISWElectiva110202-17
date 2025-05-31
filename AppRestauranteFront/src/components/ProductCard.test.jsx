import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from './ProductCard';

describe('ProductCard Component', () => {
  const mockProducto = {
    id: 1,
    nombre: 'Hamburguesa Clásica',
    descripcion: 'Deliciosa hamburguesa con carne 100% res, queso, lechuga y tomate',
    precio: 15000,
    categoria: 'PLATO_PRINCIPAL',
    estado: 'DISPONIBLE',
    imagen: '/images/hamburguesa.jpg'
  };

  const mockProductoNoDisponible = {
    ...mockProducto,
    estado: 'FUERA_STOCK'
  };

  const mockProductoSinImagen = {
    ...mockProducto,
    imagen: null
  };

  const mockProductoConImagenExterna = {
    ...mockProducto,
    imagen: 'https://example.com/hamburguesa.jpg'
  };

  const renderComponent = (producto = mockProducto) => {
    render(
      <MemoryRouter>
        <ProductCard producto={producto} />
      </MemoryRouter>
    );
  };

  beforeAll(() => {
    // Mock para imágenes fallidas
    vi.spyOn(global.Image.prototype, 'onerror', 'set').mockImplementation(() => {});
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('1. Renderiza correctamente la información del producto', () => {
    renderComponent();
    
    expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument();
    expect(screen.getByText('Deliciosa hamburguesa con carne 100% res, queso, lechuga y tomate')).toBeInTheDocument();
    expect(screen.getByText('$15,000')).toBeInTheDocument();
    expect(screen.getByText('Plato Principal')).toBeInTheDocument();
    expect(screen.getByText('Disponible')).toBeInTheDocument();
    expect(screen.getByText('Ver detalles')).toBeInTheDocument();
  });

  it('2. Muestra estado "Agotado" cuando el producto no está disponible', () => {
    renderComponent(mockProductoNoDisponible);
    
    expect(screen.getByText('Agotado')).toBeInTheDocument();
    expect(screen.getByText('No disponible')).toBeInTheDocument();
    expect(screen.getByText('AGOTADO')).toBeInTheDocument();
  });

  it('3. Muestra la categoría correcta con los colores apropiados', () => {
    renderComponent();
    
    const categoriaBadge = screen.getByText('Plato Principal');
    expect(categoriaBadge).toHaveClass('bg-amber-100');
    expect(categoriaBadge).toHaveClass('text-amber-800');
  });

  it('4. Formatea correctamente el precio', () => {
    const productoConPrecioAlto = {
      ...mockProducto,
      precio: 2500000
    };
    renderComponent(productoConPrecioAlto);
    
    expect(screen.getByText('$2,500,000')).toBeInTheDocument();
  });

  it('5. Maneja correctamente productos sin descripción', () => {
    const productoSinDescripcion = {
      ...mockProducto,
      descripcion: null
    };
    renderComponent(productoSinDescripcion);
    
    expect(screen.getByText('Sin descripción')).toBeInTheDocument();
  });

  it('6. Muestra imagen local correctamente', () => {
    renderComponent();
    
    const imagen = screen.getByAltText('Hamburguesa Clásica');
    expect(imagen).toHaveAttribute('src', 'http://localhost:8000/images/hamburguesa.jpg');
  });

  it('7. Muestra imagen externa correctamente', () => {
    renderComponent(mockProductoConImagenExterna);
    
    const imagen = screen.getByAltText('Hamburguesa Clásica');
    expect(imagen).toHaveAttribute('src', 'https://example.com/hamburguesa.jpg');
  });

  it('8. Maneja productos sin imagen', () => {
    renderComponent(mockProductoSinImagen);
    
    const imagen = screen.getByAltText('Hamburguesa Clásica');
    expect(imagen).toHaveClass('object-contain');
    expect(imagen).toHaveClass('p-4');
  });

  it('9. Deshabilita el botón cuando el producto no está disponible', () => {
    renderComponent(mockProductoNoDisponible);
    
    const boton = screen.getByText('No disponible');
    expect(boton).toHaveClass('opacity-50');
    expect(boton).toHaveClass('cursor-not-allowed');
  });

  it('10. Muestra nombres de categoría correctos para todos los tipos', () => {
    const categorias = [
      { tipo: 'PLATO_PRINCIPAL', nombre: 'Plato Principal' },
      { tipo: 'ENTRADA', nombre: 'Entrada' },
      { tipo: 'BEBIDA', nombre: 'Bebida' },
      { tipo: 'POSTRE', nombre: 'Postre' },
      { tipo: 'ADICION', nombre: 'Adición' },
      { tipo: 'OTRA', nombre: 'OTRA' }
    ];

    categorias.forEach(({ tipo, nombre }) => {
      const producto = { ...mockProducto, categoria: tipo };
      const { unmount } = render(
        <MemoryRouter>
          <ProductCard producto={producto} />
        </MemoryRouter>
      );
      
      expect(screen.getByText(nombre)).toBeInTheDocument();
      unmount();
    });
  });

  it('11. Muestra colores correctos para cada categoría', () => {
    const categorias = [
      { tipo: 'PLATO_PRINCIPAL', bg: 'bg-amber-100', text: 'text-amber-800' },
      { tipo: 'ENTRADA', bg: 'bg-green-100', text: 'text-green-800' },
      { tipo: 'BEBIDA', bg: 'bg-blue-100', text: 'text-blue-800' },
      { tipo: 'POSTRE', bg: 'bg-pink-100', text: 'text-pink-800' },
      { tipo: 'ADICION', bg: 'bg-purple-100', text: 'text-purple-800' },
      { tipo: 'OTRA', bg: 'bg-gray-200', text: 'text-gray-800' }
    ];

    categorias.forEach(({ tipo, bg, text }) => {
      const producto = { ...mockProducto, categoria: tipo };
      const { unmount } = render(
        <MemoryRouter>
          <ProductCard producto={producto} />
        </MemoryRouter>
      );
      
      const badge = screen.getByTestId('category-badge');
      expect(badge).toHaveClass(bg);
      expect(badge).toHaveClass(text);
      unmount();
    });
  });
});