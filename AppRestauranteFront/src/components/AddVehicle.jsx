import { useState, useRef } from "react";
import api from "../api/axiosConfig";

const AddVehicle = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        categoria: "BEBIDA",
        nombre: "",
        descripcion: "",
        precio: "",
        estado: "DISPONIBLE",
        imagen: null
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                setErrors({...errors, imagen: "Solo se permiten imágenes (JPEG, PNG)"});
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                setErrors({...errors, imagen: "La imagen debe ser menor a 2MB"});
                return;
            }

            setFormData(prev => ({ ...prev, imagen: file }));
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
            
            if (errors.imagen) {
                setErrors(prev => ({ ...prev, imagen: null }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
        if (formData.nombre.length > 100) newErrors.nombre = "Máximo 100 caracteres";
        if (!formData.descripcion.trim()) newErrors.descripcion = "La descripción es requerida";
        if (!formData.precio) newErrors.precio = "El precio es requerido";
        if (isNaN(formData.precio)) newErrors.precio = "Debe ser un número válido";
        if (parseFloat(formData.precio) <= 0) newErrors.precio = "El precio debe ser mayor a 0";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            const response = await api.post('/productos/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            onAdd(response.data);
            onClose();
        } catch (error) {
            console.error("Error al crear producto:", error.response?.data);
            setErrors({
                ...errors,
                server: error.response?.data?.message || 
                       error.response?.data?.imagen?.[0] || 
                       "Error al crear el producto"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 bg-white">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-red-950">Agregar Producto</h3>
                    <button 
                        onClick={onClose}
                        className="text-red-700 hover:text-gray-700 text-2xl"
                        disabled={isSubmitting}
                    >
                        &times;
                    </button>
                </div>

                {errors.server && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                        {errors.server}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-red-700">Categoría</label>
                        <select
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            required
                        >
                            <option value="PLATO_PRINCIPAL">Plato Principal</option>
                            <option value="ENTRADA">Entrada</option>
                            <option value="BEBIDA">Bebida</option>
                            <option value="ADICION">Adición</option>
                            <option value="POSTRE">Postre</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-red-700">Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className={`mt-1 block w-full border rounded-md p-2 ${
                                errors.nombre ? 'border-red-500' : 'border-gray-300'
                            }`}
                            maxLength={100}
                        />
                        {errors.nombre && (
                            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-red-700">Descripción</label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows="3"
                            className={`mt-1 block w-full border rounded-md p-2 ${
                                errors.descripcion ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.descripcion && (
                            <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-red-700">Precio</label>
                        <input
                            type="number"
                            name="precio"
                            value={formData.precio}
                            onChange={handleChange}
                            step="0.01"
                            min="0.01"
                            className={`mt-1 block w-full border rounded-md p-2 ${
                                errors.precio ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.precio && (
                            <p className="mt-1 text-sm text-red-600">{errors.precio}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-red-700">Estado</label>
                        <select
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        >
                            <option value="DISPONIBLE">Disponible</option>
                            <option value="FUERA_STOCK">Fuera de Stock</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-red-700">Imagen del Producto</label>
                        <div className="mt-1 flex items-center">
                            <label
                                htmlFor="imagen"
                                className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
                            >
                                {previewImage ? "Cambiar Imagen" : "Seleccionar Imagen"}
                            </label>
                            <input
                                id="imagen"
                                name="imagen"
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                            {previewImage && (
                                <div className="ml-4 relative">
                                    <img 
                                        src={previewImage} 
                                        alt="Vista previa" 
                                        className="h-16 w-16 object-cover rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPreviewImage(null);
                                            setFormData(prev => ({ ...prev, imagen: null }));
                                            fileInputRef.current.value = '';
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors.imagen && (
                            <p className="mt-1 text-sm text-red-600">{errors.imagen}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Formatos aceptados: JPEG, PNG (Máx. 2MB). Se redimensionará a cuadrada.
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
                        >
                            {isSubmitting ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVehicle;