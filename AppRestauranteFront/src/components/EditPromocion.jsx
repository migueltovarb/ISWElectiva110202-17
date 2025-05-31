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
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
    fecha_fin: false,
    productos: false
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
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
          productos: promoData.productos?.map(p => p.id || p) || [],
          fecha_inicio: promoData.fecha_inicio?.split('T')[0] || new Date().toISOString().split('T')[0],
          fecha_fin: promoData.fecha_fin?.split('T')[0] || '',
          estado: promoData.estado || 'ACTIVA'
        });
        
      } catch (err) {
        setError(`Error al cargar los datos: ${err.response?.data?.message || err.message}`);
        console.error(err);
      } finally {
        setIsLoading(false);
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
    setTouched(prev => ({ ...prev, productos: true }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
    if (!formData.descripcion.trim()) errors.descripcion = 'La descripción es requerida';
    if (!formData.descuento) errors.descuento = 'El descuento es requerido';
    if (formData.descuento < 1 || formData.descuento > 100) errors.descuento = 'El descuento debe ser entre 1% y 100%';
    if (!formData.fecha_fin) errors.fecha_fin = 'La fecha de fin es requerida';
    if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) errors.fecha_fin = 'La fecha fin no puede ser anterior a la fecha inicio';
    if (formData.productos.length === 0) errors.productos = 'Seleccione al menos un producto';
    
    return Object.keys(errors).length === 0 ? null : errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!user?.is_admin) {
      setError('Solo los administradores pueden editar promociones');
      return;
    }

    const formErrors = validateForm();
    if (formErrors) {
      setError('Por favor complete todos los campos correctamente');
      return;
    }

    try {
      setIsLoading(true);
      await axios.put(`/promociones/${id}/`, {
        ...formData,
        descuento: parseFloat(formData.descuento)
      });
      navigate('/promociones', { replace: true }); 
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la promoción. Intente nuevamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/promociones', { replace: true }); 
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const getFieldError = (fieldName) => {
    if (!touched[fieldName]) return null;
    
    if (!formData[fieldName] && fieldName !== 'descuento') {
      return 'Este campo es requerido';
    }
    
    if (fieldName === 'descuento') {
      if (!formData.descuento) return 'Este campo es requerido';
      if (formData.descuento < 1 || formData.descuento > 100) {
        return 'El descuento debe ser entre 1% y 100%';
      }
    }
    
    if (fieldName === 'fecha_fin' && new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
      return 'La fecha fin no puede ser anterior a la fecha inicio';
    }
    
    return null;
  };

  if (initialLoading) {
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

        {isLoading ? (
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
                onBlur={handleBlur}
                className={touched.nombre && !formData.nombre ? 'input-error' : ''}
                required
              />
              {touched.nombre && getFieldError('nombre') && (
                <span className="field-error">{getFieldError('nombre')}</span>
              )}
            </div>

            <div className="form-group">
              <label>Descripción:</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.descripcion && !formData.descripcion ? 'input-error' : ''}
                required
                rows="3"
              />
              {touched.descripcion && getFieldError('descripcion') && (
                <span className="field-error">{getFieldError('descripcion')}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Descuento (%):</label>
                <input
                  type="number"
                  name="descuento"
                  min="1"
                  max="100"
                  value={formData.descuento}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    (touched.descuento && getFieldError('descuento')) ? 'input-error' : ''
                  }
                  required
                />
                {touched.descuento && getFieldError('descuento') && (
                  <span className="field-error">{getFieldError('descuento')}</span>
                )}
              </div>

              <div className="form-group">
                <label>Estado:</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="estado-select"
                >
                  <option value="ACTIVA">Activa</option>
                  <option value="INACTIVA">Inactiva</option>
                </select>
              </div>
            </div>

            <div className="form-group productos-section">
              <label>Productos incluidos:</label>
              {touched.productos && formData.productos.length === 0 && (
                <span className="field-error">Seleccione al menos un producto</span>
              )}
              <div className="productos-grid">
                {productos.length > 0 ? (
                  productos.map(producto => (
                    <div key={producto.id} className="producto-checkbox">
                      <input
                        type="checkbox"
                        id={`producto-${producto.id}`}
                        checked={formData.productos.includes(producto.id)}
                        onChange={() => handleProductoChange(producto.id)}
                      />
                      <label htmlFor={`producto-${producto.id}`}>
                        {producto.nombre} (${producto.precio})
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="no-products">Cargando productos...</p>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha inicio:</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha fin:</label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  min={formData.fecha_inicio}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={touched.fecha_fin && getFieldError('fecha_fin') ? 'input-error' : ''}
                  required
                />
                {touched.fecha_fin && getFieldError('fecha_fin') && (
                  <span className="field-error">{getFieldError('fecha_fin')}</span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleClose} className="cancel-button">
                Cancelar
              </button>
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Actualizando...' : 'Actualizar Promoción'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditPromocion;