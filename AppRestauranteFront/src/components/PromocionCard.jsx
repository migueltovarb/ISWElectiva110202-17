import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';

const PromocionCard = ({ promocion, isAdmin, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [productosDetalles, setProductosDetalles] = useState([]);
  const [precioTotal, setPrecioTotal] = useState(0);
  const [precioConDescuento, setPrecioConDescuento] = useState(0);
  const fechaFin = new Date(promocion.fecha_fin);
  const fechaInicio = new Date(promocion.fecha_inicio);
  const hoy = new Date();
  const diasRestantes = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));

  const colors = {
    primary: '#D35400',     // Naranja café oscuro
    secondary: '#E67E22',   // Naranja cálido
    accent: '#E74C3C',      // Rojo vibrante
    light: '#FDEBD0',       // Café claro
    dark: '#7E5109',        // Café oscuro
    background: '#F5CBA7',  // Fondo café claro
    text: '#4E342E',        // Texto café oscuro
    success: '#27AE60',     // Verde para estado activo
    warning: '#F39C12',     // Amarillo/naranja para advertencias
    danger: '#C0392B'       // Rojo oscuro para eliminar
  };

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        if (promocion.productos && promocion.productos.length > 0) {
          let productosData = [];
          
          if (typeof promocion.productos[0] === 'number' || typeof promocion.productos[0] === 'string') {
            const response = await axios.get('/productos/');
            productosData = response.data.filter(p => promocion.productos.includes(p.id));
          } else {
            productosData = promocion.productos;
          }

          setProductosDetalles(productosData);
          
          const total = productosData.reduce((sum, producto) => {
            const precio = parseFloat(producto.precio) || 0;
            return sum + precio;
          }, 0);
          
          setPrecioTotal(total);
          
          const descuento = parseFloat(promocion.descuento) || 0;
          const descuentoDecimal = Math.min(Math.max(descuento, 0), 100) / 100;
          setPrecioConDescuento(total * (1 - descuentoDecimal));
        }
      } catch (error) {
        console.error('Error cargando productos de la promoción:', error);
      }
    };

    fetchProductos();
  }, [promocion.productos, promocion.descuento]);

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price) || 0;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericPrice);
  };

  const formatDiscount = (discount) => {
    const numericDiscount = parseFloat(discount) || 0;
    return Number.isInteger(numericDiscount) ? 
      numericDiscount.toString() : 
      numericDiscount.toFixed(2).replace(/\.?0+$/, '');
  };

  const getCategoryIcon = () => {
    switch(promocion.categoria) {
      case 'BEBIDA': return '🍹';
      case 'PLATO_PRINCIPAL': return '🍽️';
      case 'POSTRE': return '🍰';
      case 'COMBO': return '📦';
      default: return '🎁';
    }
  };

  const getEstadoPromocion = () => {
    if (promocion.estado === 'INACTIVA') return { texto: 'INACTIVA', color: colors.warning };
    if (hoy > fechaFin) return { texto: 'EXPIRADA', color: colors.danger };
    if (diasRestantes <= 3) return { texto: `${diasRestantes} DÍAS`, color: colors.accent };
    return { texto: 'ACTIVA', color: colors.success };
  };

  const estado = getEstadoPromocion();

  return (
    <div style={{
      border: `1px solid ${colors.primary}`,
      borderRadius: '12px',
      padding: '16px',
      margin: '10px',
      backgroundColor: colors.light,
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      color: colors.text
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>{getCategoryIcon()}</span>
          <h3 style={{ 
            margin: 0, 
            color: colors.dark,
            fontSize: '1.3rem'
          }}>
            {promocion.nombre}
          </h3>
        </div>
        <span style={{
          backgroundColor: estado.color,
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {estado.texto}
        </span>
      </div>

      <p style={{ 
        color: colors.text,
        margin: '8px 0 16px',
        fontSize: '0.95rem',
        lineHeight: '1.4'
      }}>
        {promocion.descripcion}
      </p>

      <div style={{
        background: `linear-gradient(135deg, ${colors.light} 0%, ${colors.background} 100%)`,
        border: `2px solid ${colors.secondary}`,
        borderRadius: '10px',
        padding: '16px',
        margin: '16px 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          background: colors.accent,
          color: 'white',
          padding: '4px 12px',
          fontSize: '14px',
          fontWeight: 'bold',
          borderBottomLeftRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {formatDiscount(promocion.descuento)}% OFF
        </div>

        <div style={{ 
          marginBottom: '6px', 
          color: colors.dark,
          textDecoration: 'line-through',
          opacity: 0.8,
          fontSize: '0.9rem'
        }}>
          {formatPrice(precioTotal)}
        </div>
        
        <div style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: colors.primary,
          margin: '8px 0',
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
        }}>
          {formatPrice(precioConDescuento)}
        </div>
        
        <div style={{ 
          fontSize: '12px', 
          color: colors.dark,
          marginTop: '4px',
          letterSpacing: '0.5px'
        }}>
          PRECIO FINAL CON DESCUENTO
        </div>
      </div>

      <div style={{
        margin: '16px 0',
        border: `1px solid ${colors.secondary}`,
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: colors.secondary,
          color: 'white',
          padding: '8px 12px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>📦</span>
          <span>PRODUCTOS INCLUIDOS</span>
        </div>
        
        {productosDetalles.length > 0 ? (
          <ul style={{
            listStyle: 'none',
            padding: '0',
            margin: '0',
            backgroundColor: 'rgba(255, 255, 255, 0.7)'
          }}>
            {productosDetalles.map((producto, index) => (
              <li key={producto.id || index} style={{
                padding: '10px 12px',
                borderBottom: `1px solid ${colors.background}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: '500' }}>{producto.nombre}</span>
                <span style={{ 
                  color: colors.accent,
                  fontWeight: 'bold'
                }}>
                  {formatPrice(producto.precio)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{
            padding: '12px',
            textAlign: 'center',
            color: colors.text,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            fontStyle: 'italic'
          }}>
            No hay productos especificados
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: '12px', 
        fontSize: '14px',
        backgroundColor: 'rgba(255,255,255,0.5)',
        padding: '12px',
        borderRadius: '8px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '6px',
          borderBottom: `1px dashed ${colors.secondary}`,
          paddingBottom: '6px'
        }}>
          <span style={{ color: colors.dark, fontWeight: '500' }}>Inicio:</span>
          <span>{fechaInicio.toLocaleDateString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: colors.dark, fontWeight: '500' }}>Fin:</span>
          <span>{fechaFin.toLocaleDateString()}</span>
        </div>
      </div>

      {isAdmin && (
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginTop: '20px'
        }}>
          <button 
            onClick={onEdit ? onEdit : () => navigate(`/promociones/editar/${promocion.id}`)}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: colors.secondary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              ':hover': {
                backgroundColor: colors.primary
              }
            }}
          >
            Editar
          </button>
          <button 
            onClick={onDelete}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: colors.danger,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              ':hover': {
                backgroundColor: '#8B0000'
              }
            }}
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
};

export default PromocionCard;