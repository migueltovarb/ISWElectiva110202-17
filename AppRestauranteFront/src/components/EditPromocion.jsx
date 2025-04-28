import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axiosConfig';
import '../components/Auth/Auth.css';

const EditPromocion = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState({
    initial: true,
    submitting: false
  });
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    descuento: '',
    productos: [],
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    estado: 'ACTIVA'
  });
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({
    nombre: false,
    descripcion: false,
    descuento: false,
    fecha_fin: false
  });

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/promociones');
      return;
    }

    const fetchData = async () => {
      try {
        const [promocionRes, productosRes] = await Promise.all([
          axios.get(`/promociones/${id}/`),
          axios.get('/productos/')
        ]);
        
        const promoData = promocionRes.data;
        setProductos(productosRes.data);
        
        setFormData({
          nombre: promoData.nombre || '',
          descripcion: promoData.descripcion || '',
          descuento: promoData.descuento || '',
          productos: promoData.productos?.filter(p => 
            productosRes.data.some(prod => prod.id === (p.id || p))
          ).map(p => p.id || p) || [],
          fecha_inicio: promoData.fecha_inicio?.split('T')[0] || new Date().toISOString().split('T')[0],
          fecha_fin: promoData.fecha_fin?.split('T')[0] || '',
          estado: promoData.estado || 'ACTIVA'
        });
        
      } catch (err) {
        setError(`Error al cargar datos: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(prev => ({...prev, initial: false}));
      }
    };

    fetchData();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleProductoChange = (productoId) => {
    setFormData(prev => {
      const newProductos = prev.productos.includes(productoId)
        ? prev.productos.filter(id => id !== productoId)
        : [...prev.productos, productoId];
      return { ...prev, productos: newProductos };
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
    if (!formData.descripcion.trim()) errors.descripcion = 'La descripción es requerida';
    if (!formData.descuento) errors.descuento = 'El descuento es requerido';
    if (isNaN(formData.descuento) || formData.descuento < 1 || formData.descuento > 100) {
      errors.descuento = 'El descuento debe ser un número entre 1% y 100%';
    }
    if (!formData.fecha_fin) errors.fecha_fin = 'La fecha de fin es requerida';
    if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
      errors.fecha_fin = 'La fecha fin no puede ser anterior a la fecha inicio';
    }
    if (formData.productos.length === 0) errors.productos = 'Seleccione al menos un producto';
    
    return Object.keys(errors).length === 0 ? null : errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const formErrors = validateForm();
    if (formErrors) {
      setTouched({
        nombre: true,
        descripcion: true,
        descuento: true,
        fecha_fin: true
      });
      setError('Por favor complete todos los campos correctamente');
      return;
    }

    try {
      setLoading(prev => ({...prev, submitting: true}));
      await axios.put(`/promociones/${id}/`, {
        ...formData,
        descuento: parseFloat(formData.descuento)
      });
      navigate('/promociones');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la promoción. Intente nuevamente.');
      console.error(err);
    } finally {
      setLoading(prev => ({...prev, submitting: false}));
    }
  };

  const handleClose = () => {
    navigate('/promociones');
  };

  const getFieldError = (fieldName) => {
    if (!touched[fieldName]) return null;
    
    if (!formData[fieldName] && fieldName !== 'descuento') {
      return 'Este campo es requerido';
    }
    
    if (fieldName === 'descuento') {
      if (!formData.descuento) return 'Este campo es requerido';
      if (isNaN(formData.descuento) || formData.descuento < 1 || formData.descuento > 100) {
        return 'El descuento debe ser entre 1% y 100%';
      }
    }
    
    if (fieldName === 'fecha_fin') {
      if (!formData.fecha_fin) return 'Este campo es requerido';
      if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
        return 'La fecha fin no puede ser anterior a la fecha inicio';
      }
    }
    
    return null;
  };

  if (loading.initial) {
    return (
      <div className="modal-overlay bg-white bg-opacity-30 backdrop-blur-sm z-50">
        <div className="modal-content promo-modal">
          <div className="loading-promo">
            <div className="spinner"></div>
            <p>Cargando promoción...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !loading.initial) {
    return (
      <div className="modal-overlay bg-white bg-opacity-30 backdrop-blur-sm z-50">
        <div className="modal-content promo-modal">
          <div className="error-message promo-error">
            <span>⚠️</span> {error}
          </div>
          <button className="btn-cancelar" onClick={handleClose}>
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay bg-white bg-opacity-30 backdrop-blur-sm z-50">
      <div className="modal-content promo-modal">
        <button className="close-button" onClick={handleClose}>×</button>
        <h2 className="modal-title text-xl font-bold text-red-950">Editar Promoción</h2>
        
        {error && (
          <div className="error-message promo-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {loading.submitting ? (
          <div className="loading-promo">
            <div className="spinner"></div>
            <p>Actualizando promoción...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="promo-form">
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={getFieldError('nombre') ? 'error' : ''}
              />
              {getFieldError('nombre') && <span className="error-text">{getFieldError('nombre')}</span>}
            </div>

            <div className="form-group">
              <label>Descripción:</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className={getFieldError('descripcion') ? 'error' : ''}
              />
              {getFieldError('descripcion') && <span className="error-text">{getFieldError('descripcion')}</span>}
            </div>

            <div className="form-group">
              <label>Descuento (%):</label>
              <input
                type="number"
                name="descuento"
                min="1"
                max="100"
                value={formData.descuento}
                onChange={handleChange}
                className={getFieldError('descuento') ? 'error' : ''}
              />
              {getFieldError('descuento') && <span className="error-text">{getFieldError('descuento')}</span>}
            </div>

            <div className="form-group">
              <label>Fecha Inicio:</label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Fecha Fin:</label>
              <input
                type="date"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                min={formData.fecha_inicio}
                className={getFieldError('fecha_fin') ? 'error' : ''}
              />
              {getFieldError('fecha_fin') && <span className="error-text">{getFieldError('fecha_fin')}</span>}
            </div>

            <div className="form-group">
              <label>Estado:</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              >
                <option value="ACTIVA">Activa</option>
                <option value="INACTIVA">Inactiva</option>
              </select>
            </div>

            <div className="form-group">
              <label>Productos incluidos:</label>
              {getFieldError('productos') && <span className="error-text">{getFieldError('productos')}</span>}
              <div className="productos-grid">
                {productos.map(producto => (
                  <div key={producto.id} className="producto-checkbox">
                    <input
                      type="checkbox"
                      id={`producto-${producto.id}`}
                      checked={formData.productos.includes(producto.id)}
                      onChange={() => handleProductoChange(producto.id)}
                    />
                    <label htmlFor={`producto-${producto.id}`}>
                      {producto.nombre} - ${producto.precio}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancelar" onClick={handleClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-guardar" disabled={loading.submitting}>
                {loading.submitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditPromocion;