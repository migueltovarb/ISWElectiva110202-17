import React, { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import PromocionCard from './PromocionCard';
import ProductCard from './ProductCard';
import Navbar from './Navbar';

const HomePage = () => {
  const [promociones, setPromociones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [promosResponse, productosResponse] = await Promise.all([
          axios.get('/promociones/?estado=ACTIVA'),
          axios.get('/productos/')
        ]);
        
        setPromociones(promosResponse.data);
        const productosData = productosResponse.data;
        setProductos(productosData);
        setFilteredProductos(productosData.slice(0, 8));
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = productos;
    
    if (selectedCategory !== 'TODAS') {
      result = result.filter(producto => producto.categoria === selectedCategory);
    }
    
    if (searchTerm) {
      result = result.filter(producto => 
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  )}
    
    setFilteredProductos(result.slice(0, 8)); 
  }, [selectedCategory, productos, searchTerm]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#81412f]"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-8 text-red-500">
      {error} - Intenta recargar la página
    </div>
  );

  const categorias = ['TODAS', ...new Set(productos.map(p => p.categoria))];

  return (
    <div className="font-sans bg-white min-h-screen">
      
      <div className="bg-[#f8f1e9] py-12 text-center" id="inicio-section">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-[#81412f] mb-4">"UN MUNDO LLENO DE SABOR"</h1>
          <p className="text-xl text-[#5a3927]">TE INVITAMOS A CONOCER NUESTRO MENÚ</p>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4" id="promociones-section">
        <h2 className="text-2xl font-bold text-[#81412f] mb-6">Promociones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promociones.length > 0 ? (
            promociones.map(promocion => (
              <PromocionCard 
                key={promocion.id} 
                promocion={promocion} 
                isAdmin={false}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No hay promociones disponibles en este momento
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto py-8 px-4" id="menu-section">
        <h2 className="text-2xl font-bold text-[#81412f] mb-6">Nuestro Menú</h2>
        <div className="bg-[#f8f1e9] p-4 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold text-[#5a3927] mb-4">Filtrar productos</h3>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <label htmlFor="categoria" className="block text-sm font-medium text-[#5a3927] mb-2">
                  Categoría
                </label>
                <div className="relative">
                  <select
                    id="categoria"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 pl-4 pr-10 border border-[#d1b8a8] rounded-lg bg-white text-[#5a3927] focus:ring-2 focus:ring-[#81412f] focus:border-[#81412f] appearance-none transition-all duration-200"
                  >
                    {categorias.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-6 text-[#5a3927]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <label htmlFor="busqueda" className="block text-sm font-medium text-[#5a3927] mb-2">
                Buscar
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="busqueda"
                  placeholder="Nombre, descripción..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 pl-10 border border-[#d1b8a8] rounded-lg bg-white text-[#5a3927] focus:ring-2 focus:ring-[#81412f] focus:border-[#81412f] transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none pt-6">
                </div>
              </div>
            </div>
          </div>
          
          { (selectedCategory !== 'TODAS' || searchTerm) && (
            <div className="mt-4 text-right">
              <button
                onClick={() => {
                  setSelectedCategory('TODAS');
                  setSearchTerm('');
                }}
                className="text-sm text-[#81412f] hover:text-[#5a3927] font-medium underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProductos.length > 0 ? (
            filteredProductos.map(producto => (
              <ProductCard 
                key={producto.id}
                producto={producto}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No se encontraron productos con los filtros aplicados
            </div>
          )}
        </div>
      </div>

      <footer className="bg-[#81412f] text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} La Receta Perfecta - Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;