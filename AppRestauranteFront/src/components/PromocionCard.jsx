import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig'; // Asegúrate que este import esté bien.

const PromocionCard = ({ promocion, isAdmin, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [productosDetalles, setProductosDetalles] = useState([]);
  const fechaFin = new Date(promocion.fecha_fin);
  const fechaInicio = new Date(promocion.fecha_inicio);
  const hoy = new Date();
  const diasRestantes = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        if (promocion.productos && promocion.productos.length > 0) {
          // Si productos son solo IDs (números), los buscamos
          if (typeof promocion.productos[0] === 'number') {
            const response = await axios.get('/productos/');
            const todosProductos = response.data;
            const productosFiltrados = todosProductos.filter(p => promocion.productos.includes(p.id));
            setProductosDetalles(productosFiltrados);
          } else {
            // Si ya viene con nombre y categoría, los usamos directo
            setProductosDetalles(promocion.productos);
          }
        }
      } catch (error) {
        console.error('Error cargando productos de la promoción:', error);
      }
    };

    fetchProductos();
  }, [promocion.productos]);

  // Función para obtener el icono de categoría
  const getCategoryIcon = () => {
    switch(promocion.categoria) {
      case 'BEBIDA': return '🍹';
      case 'PLATO_PRINCIPAL': return '🍽️';
      case 'POSTRE': return '🍰';
      case 'COMBO': return '📦';
      default: return '🎁';
    }
  };

  // Determinar el estado de la promoción
  const getEstadoPromocion = () => {
    if (promocion.estado === 'INACTIVA') return { texto: '⏳ INACTIVA', clase: 'inactive' };
    if (hoy > fechaFin) return { texto: '✋ EXPIRADA', clase: 'expired' };
    if (diasRestantes <= 3) return { texto: `🔥 ${diasRestantes} días`, clase: 'urgent' };
    return { texto: '✅ ACTIVA', clase: 'active' };
  };

  const estado = getEstadoPromocion();

  return (
    <div className={`promo-card ${promocion.estado === 'ACTIVA' ? 'active' : 'inactive'}`}>
      <div className="promo-header">
        <div className="promo-category">
          {getCategoryIcon()} {promocion.categoria || 'Promoción'}
        </div>
        <div className={`promo-badge ${estado.clase}`}>
          {estado.texto}
        </div>
      </div>

      <div className="promo-content">
        <h3 className="promo-title">{promocion.nombre}</h3>
        <p className="promo-desc">{promocion.descripcion}</p>

        <div className="promo-discount">
          <span className="discount-value">{promocion.descuento}%</span>
          <span className="discount-label">DESCUENTO</span>
        </div>

        {/* Sección de productos */}
        <div className="promo-products">
          <h4>📦 Productos incluidos:</h4>
          
          {productosDetalles.length > 0 ? (
            <ul className="productos-list">
              {productosDetalles.map((producto, index) => (
                <li key={producto.id || index} className="producto-item">
                  <span className="product-name">{producto.nombre}</span>
                  {producto.categoria && (
                    <span className="product-category">{producto.categoria}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-products">No se especificaron productos para esta promoción</p>
          )}
        </div>

        <div className="promo-dates">
          <div className="date-range">
            <span>🗓️ Inicio: {fechaInicio.toLocaleDateString()}</span>
            <span> → </span>
            <span>🗓️ Fin: {fechaFin.toLocaleDateString()}</span>
          </div>
          <div className={`days-left ${estado.clase}`}>
            {hoy > fechaFin ? 'Expirada' : `${diasRestantes} días restantes`}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="promo-actions">
          <button 
            onClick={onEdit ? onEdit : () => navigate(`/promociones/editar/${promocion.id}`)}
            className="action-btn edit-btn"
          >
            ✏️ Editar
          </button>
          <button 
            onClick={onDelete}
            className="action-btn delete-btn"
          >
            🗑️ Eliminar
          </button>
        </div>
      )}
    </div>
  );
};

export default PromocionCard;
