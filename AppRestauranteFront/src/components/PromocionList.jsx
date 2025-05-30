import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PromocionCard from './PromocionCard';
import CreatePromocion from './CreatePromocion';
import '../components/Auth/Auth.css';
import axios from '../api/axiosConfig';

const PromocionList = () => {
  const { user } = useAuth();
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const mockPromociones = [
    {
      id: 1,
      nombre: "2x1 en Bebidas Premium",
      descripcion: "Lleva dos bebidas premium y paga solo una",
      descuento: 50,
      productos: [
        { id: 1, nombre: "Vino Tinto", categoria: "BEBIDA" },
        { id: 2, nombre: "Cerveza Artesanal", categoria: "BEBIDA" }
      ],
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estado: "ACTIVA",
      estado_nombre: "Activa",
      categoria: "BEBIDA"
    },
    {
      id: 2,
      nombre: "Combo Familiar",
      descripcion: "2 platos principales + 2 postres",
      descuento: 30,
      productos: [
        { id: 3, nombre: "Lasaña", categoria: "PLATO_PRINCIPAL" },
        { id: 4, nombre: "Tiramisú", categoria: "POSTRE" }
      ],
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estado: "ACTIVA",
      estado_nombre: "Activa",
      categoria: "COMBO"
    }
  ];

  useEffect(() => {
    const fetchPromociones = async () => {
      try {
        const response = await axios.get('/promociones/');
        setPromociones(response.data);
      } catch (err) {
        console.error("Error fetching promociones:", err);
        setError(err.message || 'Error al cargar promociones');
        if (import.meta.env.DEV) {
          console.warn("Usando datos mock de desarrollo");
          setPromociones(mockPromociones);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPromociones();
  }, []);

  const filteredPromociones = promociones.filter(promocion => {
    const matchesSearch = promocion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          promocion.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = user?.is_admin || promocion.estado === 'ACTIVA';
    
    return matchesSearch && matchesStatus;
  });

  const handleCreatePromocion = (nuevaPromocion) => {
    setPromociones([...promociones, nuevaPromocion]);
    setShowCreateForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta promoción?')) return;
    try {
      await axios.delete(`/promociones/${id}/`);
      setPromociones(promociones.filter(p => p.id !== id));
    } catch (err) {
      setError('Error al eliminar promoción');
      console.error(err);
    }
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Cargando promociones...</p>
    </div>
  );

  if (error) return (
    <div className="error-screen">
      <div className="error-content">
        <h3>¡Ups! Algo salió mal</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Reintentar
        </button>
      </div>
    </div>
  );

  return (
    <div className="promociones-container">
      <div className="promociones-header glass-effect">
        <div className="header-content">
          <h1 className="promociones-title">
            {user?.is_admin ? '🎯 Gestión de Promociones' : '✨ Promociones Especiales'}
          </h1>
          <p className="promociones-subtitle">
            {user?.is_admin ? 'Administra todas las promociones' : 'Descubre nuestras mejores ofertas'}
          </p>
        </div>
        
        {user?.is_admin && (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="create-button floating-btn"
          >
            <span>+</span> Crear Nueva
          </button>
        )}
      </div>

      <div className="controls-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar promociones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="promociones-content">
        {filteredPromociones.length === 0 ? (
          <div className="empty-state">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" 
              alt="Sin promociones"
              className="empty-image"
            />
            <h3>No hay promociones disponibles</h3>
            <p>{searchTerm ? 'Intenta con otra búsqueda' : 'No se encontraron promociones'}</p>
            {user?.is_admin && (
              <button 
                onClick={() => setShowCreateForm(true)}
                className="create-button"
              >
                Crear primera promoción
              </button>
            )}
          </div>
        ) : (
          <div className="promociones-grid">
            {filteredPromociones.map(promocion => (
              <PromocionCard
                key={promocion.id}
                promocion={promocion}
                onEdit={() => navigate(`/promociones/editar/${promocion.id}`)}
                onDelete={() => handleDelete(promocion.id)}
                isAdmin={user?.is_admin}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateForm && (
        <CreatePromocion
          onClose={() => setShowCreateForm(false)}
          onCreate={handleCreatePromocion}
        />
      )}
    </div>
  );
};

export default PromocionList;