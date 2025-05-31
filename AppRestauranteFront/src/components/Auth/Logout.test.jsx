// tests/Logout.test.jsx
// tests/Logout.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Logout from '../Logout';
import { AuthContext } from '../../../context/AuthContext';

const mockNavigate = vi.fn();

// Mock de react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Logout component', () => {
  const logout = vi.fn();

  const renderComponent = () => {
    render(
      <AuthContext.Provider value={{ logout }}>
        <BrowserRouter>
          <Logout />
        </BrowserRouter>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a logout y navega a /login al montarse', async () => {
    renderComponent();

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
