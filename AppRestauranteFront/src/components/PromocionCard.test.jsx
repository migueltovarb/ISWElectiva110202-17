import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import PromocionCard from './PromocionCard';

// Mocks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('../api/axiosConfig');

describe('PromocionCard Component', () => {
  const mockPromocion = {
    id: 1,
    nombre: 'Combo Familiar',
    descripcion: 'Perfecto para compartir en familia',
    descuento: 20,
    fecha_inicio: '2023-01-01',
    fecha_fin: '2023-12-31',
    estado: 'ACTIVA',
    categoria: 'COMBO',
    productos: [1, 2]
  };

  const mockProductos = [
    { id: 1, nombre: 'Pizza Grande', precio: 25000 },
    { id: 2, nombre: 'Bebida 1L', precio: 5000 }
  ];

  const mockNavigate = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    axios.get.mockResolvedValue({ data: mockProductos });
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      promocion: mockPromocion,
      isAdmin: false,
      onEdit: mockOnEdit,
      onDelete: mockOnDelete
    };
    
    render(
      <MemoryRouter>
        <PromocionCard {...defaultProps} {...props} />
      </MemoryRouter>
    );
  };

  it('1. Renderiza correctamente la información básica de la promoción', async () => {
    renderComponent();
    
    await screen.findByText('Combo Familiar');
    expect(screen.getByText('Perfecto para compartir en familia')).toBeInTheDocument();
    expect(screen.getByText('20% OFF')).toBeInTheDocument();
    expect(screen.getByText('ACTIVA')).toBeInTheDocument();
    expect(screen.getByText('📦')).toBeInTheDocument(); // Icono de categoría
  });

  it('2. Muestra correctamente los productos incluidos', async () => {
    renderComponent();
    
    await screen.findByText('Pizza Grande');
    expect(screen.getByText('Pizza Grande')).toBeInTheDocument();
    expect(screen.getByText('Bebida 1L')).toBeInTheDocument();
    expect(screen.getByText('$25,000')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('3. Calcula y muestra correctamente los precios', async () => {
    renderComponent();
    
    await screen.findByText('$30,000');
    expect(screen.getByText('$30,000')).toBeInTheDocument(); // Precio total
    expect(screen.getByText('$24,000')).toBeInTheDocument(); // Precio con descuento
  });

  it('4. Muestra estado "EXPIRADA" cuando la fecha ha pasado', async () => {
    const expiredPromo = {
      ...mockPromocion,
      fecha_fin: '2022-12-31'
    };
    renderComponent({ promocion: expiredPromo });
    
    await screen.findByText('EXPIRADA');
    expect(screen.getByText('EXPIRADA')).toBeInTheDocument();
  });

  it('5. Muestra días restantes cuando faltan 3 días o menos', async () => {
    // Mock de fecha actual
    const originalDate = global.Date;
    const mockDate = new Date('2023-12-28');
    global.Date = class extends originalDate {
      constructor() {
        super();
        return mockDate;
      }
    };

    renderComponent();
    
    await screen.findByText('3 DÍAS');
    expect(screen.getByText('3 DÍAS')).toBeInTheDocument();
    
    // Restaurar Date original
    global.Date = originalDate;
  });

  it('6. Muestra "No hay productos especificados" cuando no hay productos', async () => {
    const noProductsPromo = {
      ...mockPromocion,
      productos: []
    };
    renderComponent({ promocion: noProductsPromo });
    
    await screen.findByText('No hay productos especificados');
    expect(screen.getByText('No hay productos especificados')).toBeInTheDocument();
  });

  it('7. Muestra botones de administración solo cuando isAdmin es true', async () => {
    // Primero con isAdmin false
    renderComponent({ isAdmin: false });
    expect(screen.queryByText('Editar')).not.toBeInTheDocument();
    expect(screen.queryByText('Eliminar')).not.toBeInTheDocument();
    
    // Luego con isAdmin true
    renderComponent({ isAdmin: true });
    await screen.findByText('Editar');
    expect(screen.getByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('8. Llama a onEdit cuando se hace clic en Editar', async () => {
    renderComponent({ isAdmin: true });
    
    const editButton = await screen.findByText('Editar');
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('9. Llama a onDelete cuando se hace clic en Eliminar', async () => {
    renderComponent({ isAdmin: true });
    
    const deleteButton = await screen.findByText('Eliminar');
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('10. Navega a la página de edición cuando no hay onEdit y es admin', async () => {
    renderComponent({ isAdmin: true, onEdit: undefined });
    
    const editButton = await screen.findByText('Editar');
    fireEvent.click(editButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/promociones/editar/1');
  });

  it('11. Maneja correctamente diferentes categorías', async () => {
    const categories = [
      { type: 'BEBIDA', icon: '🍹' },
      { type: 'PLATO_PRINCIPAL', icon: '🍽️' },
      { type: 'POSTRE', icon: '🍰' },
      { type: 'COMBO', icon: '📦' },
      { type: 'OTRA', icon: '🎁' }
    ];

    for (const category of categories) {
      const promo = { ...mockPromocion, categoria: category.type };
      const { unmount } = render(
        <MemoryRouter>
          <PromocionCard promocion={promo} />
        </MemoryRouter>
      );
      
      expect(screen.getByText(category.icon)).toBeInTheDocument();
      unmount();
    }
  });

  it('12. Maneja correctamente productos como objetos', async () => {
    const promoWithProducts = {
      ...mockPromocion,
      productos: mockProductos // Enviar los objetos completos
    };
    
    renderComponent({ promocion: promoWithProducts });
    
    await screen.findByText('Pizza Grande');
    expect(screen.getByText('Pizza Grande')).toBeInTheDocument();
    expect(screen.getByText('Bebida 1L')).toBeInTheDocument();
  });

  it('13. Formatea correctamente descuentos con decimales', async () => {
    const promoWithDecimalDiscount = {
      ...mockPromocion,
      descuento: 15.5
    };
    
    renderComponent({ promocion: promoWithDecimalDiscount });
    
    await screen.findByText('15.5% OFF');
    expect(screen.getByText('15.5% OFF')).toBeInTheDocument();
  });
});