import { useState } from 'react';
import api from '../api/axiosConfig';

const EditVehicle = ({ vehicle, onClose, onEdit }) => {
    const [formData, setFormData] = useState({
        categoria: vehicle.categoria,
        nombre: vehicle.nombre,
        descripcion: vehicle.descripcion,
        precio: vehicle.precio,
        estado: vehicle.estado
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ 
            ...formData, 
            [e.target.name]: e.target.value 
        });
    };

    const validateForm = () => {
        let newErrors = {};
        
        if (!formData.nombre) newErrors.nombre = "El nombre es requerido";
        if (formData.nombre.length > 100) newErrors.nombre = "Máximo 100 caracteres";
        if (!formData.descripcion) newErrors.descripcion = "La descripción es requerida";
        if (!formData.precio) newErrors.precio = "El precio es requerido";
        if (isNaN(formData.precio)) newErrors.precio = "Debe ser un número válido";
        if (formData.precio <= 0) newErrors.precio = "El precio debe ser mayor a 0";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validación mejorada
        const formIsValid = validateForm();
        if (!formIsValid) return;
    
        setIsSubmitting(true);
        setErrors(prev => ({...prev, server: null}));
    
        try {
            const response = await api.put(`/productos/${vehicle.id}/?_=${Date.now()}`, formData);
            
            if (!response.data) {
                throw new Error("La respuesta no contiene datos");
            }
    
            // Actualización optimizada
            onEdit({
                ...vehicle,  // Mantiene todos los campos originales
                ...response.data  // Sobrescribe con los campos actualizados
            });
            
            onClose();
        } catch (error) {
            console.error("Detalles del error:", {
                message: error.message,
                response: error.response?.data
            });
    
            const errorMessage = error.response?.status === 200
                ? "Cambios guardados. Refresque para ver actualizaciones."
                : error.response?.data?.message || "Error al comunicarse con el servidor";
    
            setErrors(prev => ({...prev, server: errorMessage}));
    
            // Cierre automático solo si la API respondió con éxito
            if (error.response?.status === 200) {
                setTimeout(onClose, 1500);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-30 backdrop-blur-sm z-50">
            <div className='bg-white p-5 rounded-xl shadow-lg w-full max-w-md'>
                <div className="border-b border-gray-200 pb-4 mb-5">
                    <h2 className="text-2xl font-bold text-amber-900">Editar Producto</h2>
                    
                </div>
                
                {errors.server && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                        <p>{errors.server}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-5'>
                    <div>
                        <label className='block text-sm font-medium text-amber-900 mb-1'>Categoría</label>
                        <select
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChange}
                            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-red-500'
                        >
                            <option value="PLATO_PRINCIPAL">Plato Principal</option>
                            <option value="ENTRADA">Entrada</option>
                            <option value="BEBIDA">Bebida</option>
                            <option value="ADICION">Adición</option>
                            <option value="POSTRE">Postre</option>
                        </select>
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-amber-900 mb-1'>Nombre</label>
                        <input 
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-red-500'
                        />
                        {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-amber-900 mb-1'>Descripción</label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-red-500'
                            rows="3"
                        />
                        {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>}
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-amber-900 mb-1'>Precio</label>
                        <div className="relative">
                            <input 
                                type="number"
                                name="precio"
                                value={formData.precio}
                                onChange={handleChange}
                                className='w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-red-500'
                                step="0.01"
                            />
                        </div>
                        {errors.precio && <p className="mt-1 text-sm text-red-600">{errors.precio}</p>}
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-amber-900 mb-1'>Estado</label>
                        <select 
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-red-500'
                        >
                            <option value="DISPONIBLE">Disponible</option>
                            <option value="FUERA_STOCK">Fuera de Stock</option>
                        </select>
                    </div>

                    <div className='flex justify-end space-x-3 pt-4'>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className='px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className='px-5 py-2.5 bg-red-700 text-white rounded-lg hover:bg-red-500 disabled:bg-red-400 transition-colors'
                        >
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditVehicle;