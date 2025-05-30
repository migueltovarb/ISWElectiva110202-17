import { Link } from 'react-router-dom';

const ProductCard = ({ producto }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const isAvailable = producto.estado === 'DISPONIBLE';

  const getCategoryColor = () => {
    const categoryMap = {
      'PLATO_PRINCIPAL': 'bg-amber-100 text-amber-800',
      'ENTRADA': 'bg-green-100 text-green-800',
      'BEBIDA': 'bg-blue-100 text-blue-800',
      'POSTRE': 'bg-pink-100 text-pink-800',
      'ADICION': 'bg-purple-100 text-purple-800'
    };
    return categoryMap[producto.categoria] || 'bg-gray-200 text-gray-800';
  };

  const getImageUrl = () => {
    if (producto.imagen) {
      if (producto.imagen.startsWith('http')) {
        return producto.imagen;
      }
      return `http://localhost:8000${producto.imagen}`;
    }
  };

  const getCategoryName = () => {
    const categoryNames = {
      'PLATO_PRINCIPAL': 'Plato Principal',
      'ENTRADA': 'Entrada',
      'BEBIDA': 'Bebida',
      'POSTRE': 'Postre',
      'ADICION': 'Adición'
    };
    return categoryNames[producto.categoria] || producto.categoria;
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white flex flex-col w-full">
      <div className={`px-3 py-1 text-xs font-semibold ${getCategoryColor()}`}>
        {getCategoryName()}
      </div>
      
      <div className="relative w-full aspect-square overflow-hidden group">
        <img 
          src={getImageUrl()}
          alt={producto.nombre}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.className = "w-full h-full object-contain p-4";
          }}
        />
        
        <div className="absolute top-2 right-2 bg-[#81412f]/90 text-white text-sm font-bold px-2 py-1 rounded-full backdrop-blur-sm">
          ${formatPrice(producto.precio)}
        </div>
        
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold bg-red-500 px-2 py-1 rounded-md text-xs">
              AGOTADO
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-1" title={producto.nombre}>
          {producto.nombre}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow" title={producto.descripcion}>
          {producto.descripcion || "Sin descripción"}
        </p>

        <div className="flex justify-between items-center mt-auto">
          <span className={`text-xs font-medium ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
            {isAvailable ? 'Disponible' : 'Agotado'}
          </span>
          <Link 
            to={`/producto/${producto.id}`} 
            className={`bg-[#81412f] hover:bg-[#5a3927] text-white px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium ${
              !isAvailable ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={e => !isAvailable && e.preventDefault()}
          >
            {isAvailable ? 'Ver detalles' : 'No disponible'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;