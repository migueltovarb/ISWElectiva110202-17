import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const CreateEmployee = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    tipo_empleado: 'MES',
    telefono: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/empleados/', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      navigate('/admin');
    } catch (error) {
      console.error('Error creando empleado:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!user?.is_admin) {
    navigate('/');
    return null;
  }

  return (
    <div className="justify-between max-w-md mx-auto mt-10 p-5 bg-white rounded-lg shadow-md">
      <h2 className="text-center text-2xl font-bold text-amber-900 mb-6">Crear Nuevo Empleado</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-gray-700 mb-1">
            Nombre de usuario
          </label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>

        <div>
          <label htmlFor="tipo_empleado" className="block text-gray-700 mb-1">
            Tipo de empleado
          </label>
          <select
            id="tipo_empleado"
            name="tipo_empleado"
            value={formData.tipo_empleado}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-amber-500"
          >
            <option value="MES">Mesero</option>
            <option value="ADM">Administrador</option>
          </select>
        </div>

        <div>
          <label htmlFor="telefono" className="block text-gray-700 mb-1">
            Teléfono (opcional)
          </label>
          <input
            id="telefono"
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-700 mt-4"
        >
          Crear Empleado
        </button>
      </form>
    </div>
  );
};

export default CreateEmployee;