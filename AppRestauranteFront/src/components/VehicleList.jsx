import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import AddVehicle from "./AddVehicle";
import EditVehicle from "./EditVehicle";

const CATEGORIAS = [
  { id: 'TODAS', nombre: 'Todas las categorías' },
  { id: 'ENTRADA', nombre: 'Entradas' },
  { id: 'PLATO_PRINCIPAL', nombre: 'Platos Principales' },
  { id: 'BEBIDA', nombre: 'Bebidas' },
  { id: 'POSTRE', nombre: 'Postres' },
  { id: 'ADICION', nombre: 'Adiciones' }
];

const VehicleList = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const canEdit = user?.is_admin || user?.tipo_empleado === 'MES';
  const canAdd = user?.is_admin;
  const canDelete = user?.is_admin;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/productos/');
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;
    
    if (selectedCategory !== 'TODAS') {
      result = result.filter(product => product.categoria === selectedCategory);
    }
    
    if (searchTerm) {
      result = result.filter(product => 
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, products, searchTerm]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    
    try {
      await api.delete(`/productos/${id}/`);
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("No se pudo eliminar el producto");
    }
  };

  const handleAddProduct = (newProduct) => {
    setProducts([...products, newProduct]);
    setShowAddProduct(false);
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts(products.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
    setSelectedProduct(null);
  };

  const getEstadoStyles = (estado) => {
    return estado === 'DISPONIBLE' 
      ? 'bg-green-100 text-green-800 border border-green-200' 
      : 'bg-red-100 text-red-800 border border-red-200';
  };

  const getCategoryColor = (categoria) => {
    const colors = {
      'ENTRADA': 'bg-purple-100 text-purple-800 border border-purple-200',
      'PLATO_PRINCIPAL': 'bg-blue-100 text-blue-800 border border-blue-200',
      'BEBIDA': 'bg-amber-100 text-amber-800 border border-amber-200',
      'POSTRE': 'bg-pink-100 text-pink-800 border border-pink-200',
      'ADICION': 'bg-indigo-100 text-indigo-800 border border-indigo-200'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {canEdit ? "Gestión de Productos" : "Menú Disponible"}
          </h1>
          <p className="text-gray-600 mt-1">Administra todos los productos del menú</p>
        </div>
        
        {canAdd && (
          <button
            onClick={() => setShowAddProduct(true)}
            className="flex items-center bg-[#81412f] hover:bg-[#ff7c7c] text-white px-4 py-2 rounded-lg transition-colors mt-4 md:mt-0 shadow-sm"
          >
            <span className="mr-2">+</span>
            Añadir Producto
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            
            </div>
            <input
              type="text"
              placeholder="Buscar productos por nombre o descripción..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] w-full md:w-64"
            >
              <div className="flex items-center">
                <span className="mr-2 text-gray-400">⏫</span>
                <span>{CATEGORIAS.find(c => c.id === selectedCategory)?.nombre}</span>
              </div>
              <span className={`ml-2 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}>▼</span>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full md:w-64 bg-white border border-gray-300 rounded-lg shadow-lg">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-50 ${
                      selectedCategory === cat.id ? 'bg-[#4F46E5] text-white font-medium' : 'text-gray-700'
                    }`}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Estado</th>
                {canEdit && <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{product.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs rounded-full ${getCategoryColor(product.categoria)}`}>
                        {product.categoria_nombre || product.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="line-clamp-2">{product.descripcion}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${parseFloat(product.precio).toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getEstadoStyles(product.estado)}`}>
                        {product.estado_nombre || product.estado}
                      </span>
                    </td>
                    
                    {canEdit && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setSelectedProduct(product)}
                            className="text-[#4F46E5] hover:text-[#4338CA] p-2 rounded hover:bg-[#EEF2FF] transition-colors"
                            title="Editar"
                          >
                            ✏️ Editar
                          </button>
                          {canDelete && (
                            <button 
                              onClick={() => handleDelete(product.id)}
                              className="text-[#DC2626] hover:text-[#B91C1C] p-2 rounded hover:bg-[#FEE2E2] transition-colors"
                              title="Eliminar"
                            >
                              🗑️ Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddProduct && (
        <AddVehicle 
          onClose={() => setShowAddProduct(false)}
          onAdd={handleAddProduct}
          categorias={CATEGORIAS.filter(cat => cat.id !== 'TODAS')}
        />
      )}
      
      {selectedProduct && (
        <EditVehicle 
          vehicle={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={handleUpdateProduct}
          categorias={CATEGORIAS.filter(cat => cat.id !== 'TODAS')}
        />
      )}
    </div>
  );
};

export default VehicleList;