import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axiosConfig';
import PromocionList from './PromocionList';

// Mocks
vi.mock('../context/AuthContext');
vi.mock('../api/axiosConfig');
vi.mock('./PromocionCard', () => ({
  __esModule: true,
  default: ({ promocion }) => <div data-testid="promocion-card">{promocion.nombre}</div>
}));
vi.mock('./CreatePromocion', () => ({
  __esModule: true,
  default: ({ onClose, onCreate }) => (
    <div data-testid="create-promocion">
      <button onClick={onClose}>Cerrar</button>
      <button onClick={() => onCreate({ id: 999, nombre: 'Nueva Promo' })}>Crear</button>
    </div>
  )
}));

describe('PromocionList Component', () => {
  const mockPromociones = [
    {
      id: 1,
      nombre: "Promo 1",
      descripcion: "Descripción 1",
      estado: "ACTIVA"
    },
    {
      id: 2,
      nombre: "Promo 2",
      descripcion: "Descripción 2",
      estado: "ACTIVA"
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockPromociones });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithUser = (user = { is_admin: false }) => {
    useAuth.mockReturnValue({ user });
    render(
      <MemoryRouter>
        <PromocionList />
      </MemoryRouter>
    );
  };

  it('1. Muestra estado de carga inicial', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    renderWithUser();
    
    expect(screen.getByText('Cargando promociones...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('2. Muestra error cuando falla la carga', async () => {
    axios.get.mockRejectedValue(new Error('Error de red'));
    renderWithUser();
    
    await waitFor(() => {
      expect(screen.getByText('¡Ups! Algo salió mal')).toBeInTheDocument();
      expect(screen.getByText('Error de red')).toBeInTheDocument();
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });
  });

  it('3. Carga y muestra promociones correctamente', async () => {
    renderWithUser();
    
    await waitFor(() => {
      expect(screen.getByText('Promociones Especiales')).toBeInTheDocument();
      expect(screen.getAllByTestId('promocion-card').length).toBe(2);
      expect(screen.getByText('Promo 1')).toBeInTheDocument();
      expect(screen.getByText('Promo 2')).toBeInTheDocument();
    });
  });

  it('4. Muestra título de administración para admin', async () => {
    renderWithUser({ is_admin: true });
    
    await waitFor(() => {
      expect(screen.getByText('Gestión de Promociones')).toBeInTheDocument();
      expect(screen.getByText('Crear Nueva')).toBeInTheDocument();
    });
  });

  it('5. Filtra promociones por término de búsqueda', async () => {
    renderWithUser();
    
    await waitFor(() => {
      expect(screen.getByText('Promo 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar promociones...');
    fireEvent.change(searchInput, { target: { value: 'Promo 2' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Promo 1')).not.toBeInTheDocument();
      expect(screen.getByText('Promo 2')).toBeInTheDocument();
    });
  });

  it('6. Muestra estado vacío cuando no hay resultados', async () => {
    axios.get.mockResolvedValue({ data: [] });
    renderWithUser();
    
    await waitFor(() => {
      expect(screen.getByText('No hay promociones disponibles')).toBeInTheDocument();
      expect(screen.getByText('No se encontraron promociones')).toBeInTheDocument();
    });
  });

  it('7. Muestra botón de creación solo para admin', async () => {
    // Usuario normal
    renderWithUser({ is_admin: false });
    await waitFor(() => {
      expect(screen.queryByText('Crear Nueva')).not.toBeInTheDocument();
    });
    
    // Admin
    renderWithUser({ is_admin: true });
    await waitFor(() => {
      expect(screen.getByText('Crear Nueva')).toBeInTheDocument();
    });
  });

  it('8. Abre y cierra el formulario de creación', async () => {
    renderWithUser({ is_admin: true });
    
    const createButton = await screen.findByText('Crear Nueva');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('create-promocion')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByText('Cerrar');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('create-promocion')).not.toBeInTheDocument();
    });
  });

  it('9. Agrega nueva promoción al crear', async () => {
    renderWithUser({ is_admin: true });
    
    const createButton = await screen.findByText('Crear Nueva');
    fireEvent.click(createButton);
    
    const createPromoButton = await screen.findByText('Crear');
    fireEvent.click(createPromoButton);
    
    await waitFor(() => {
      expect(screen.getByText('Nueva Promo')).toBeInTheDocument();
    });
  });

  it('10. Usa datos mock en desarrollo cuando falla la API', async () => {
    process.env.NODE_ENV = 'development';
    axios.get.mockRejectedValue(new Error('Error de API'));
    
    renderWithUser();
    
    await waitFor(() => {
      expect(screen.getByText('Promociones Especiales')).toBeInTheDocument();
      expect(screen.getByText('2x1 en Bebidas Premium')).toBeInTheDocument();
      expect(screen.getByText('Combo Familiar')).toBeInTheDocument();
    });
    
    process.env.NODE_ENV = 'test';
  });

  it('11. Filtra promociones inactivas para usuarios no admin', async () => {
    const promocionesConInactivas = [
      ...mockPromociones,
      { id: 3, nombre: "Promo Inactiva", estado: "INACTIVA" }
    ];
    axios.get.mockResolvedValue({ data: promocionesConInactivas });
    
    renderWithUser({ is_admin: false });
    
    await waitFor(() => {
      expect(screen.getAllByTestId('promocion-card').length).toBe(2);
      expect(screen.queryByText('Promo Inactiva')).not.toBeInTheDocument();
    });
  });

  it('12. Muestra todas las promociones para admin', async () => {
    const promocionesConInactivas = [
      ...mockPromociones,
      { id: 3, nombre: "Promo Inactiva", estado: "INACTIVA" }
    ];
    axios.get.mockResolvedValue({ data: promocionesConInactivas });
    
    renderWithUser({ is_admin: true });
    
    await waitFor(() => {
      expect(screen.getAllByTestId('promocion-card').length).toBe(3);
      expect(screen.getByText('Promo Inactiva')).toBeInTheDocument();
    });
  });
});