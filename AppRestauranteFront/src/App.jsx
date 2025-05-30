 import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import VehicleList from './components/VehicleList';
import PromocionList from './components/PromocionList';
import EditPromocion from './components/EditPromocion'; // 1. Importa el nuevo componente
import Logout from './components/Auth/Logout';
import Navbar from './components/Navbar';
import CreateEmployee from './components/Auth/CreateEmployee';
import HomePage from './components/HomePage';
import GuestNavbar from './components/GuestNavbar';
import UserNavbar from './components/UserNavbar';
import RegisterCustomer from './components/Auth/RegisterCustomer';
import CustomerHomePage from './components/CustomerHomePage';

// Layout para rutas públicas
const PublicLayout = ({ children }) => {
  const { user, userType } = useAuth();
  return (
    <>
      {user && userType === 'customer' ? <UserNavbar /> : <GuestNavbar />}
      <main>{children}</main>
    </>
  );
};

// Layout para rutas del personal
const StaffLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="pt-16">{children}</main>
  </>
);

// Componente para redirección inteligente
const AuthRedirector = () => {
  const { user, userType } = useAuth();

  if (user) {
    if (userType === 'customer') {
      return <Navigate to="/customer-home" replace />;
    }
    return user?.is_admin ? (
      <Navigate to="/admin" replace />
    ) : (
      <Navigate to="/mesero" replace />
    );
  }

  return <Navigate to="/" replace />;
};

// Componente para rutas privadas
const PrivateRoute = ({ children, adminOnly = false, forCustomers = false }) => {
  const { user, loading, userType } = useAuth();

  if (loading) return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  
  if (!user) return <Navigate to={forCustomers ? "/login-cliente" : "/login"} replace />;
  
  if (adminOnly && !user.is_admin) return <Navigate to="/" replace />;
  
  if (forCustomers && userType !== 'customer') return <Navigate to="/" replace />;

  return forCustomers ? (
    <PublicLayout>{children}</PublicLayout>
  ) : (
    <StaffLayout>{children}</StaffLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Página principal para invitados */}
          <Route path="/" element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          } />

          {/* Página principal para clientes autenticados */}
          <Route path="/customer-home" element={
            <PrivateRoute forCustomers>
              <CustomerHomePage />
            </PrivateRoute>
          } />

          {/* Autenticación */}
          <Route path="/login" element={
            <PublicLayout>
              <Login />
            </PublicLayout>
          } />
          <Route path="/logout" element={
            <PublicLayout>
              <Logout />
            </PublicLayout>
          } />
          <Route path="/auth-redirect" element={<AuthRedirector />} />

          {/* Rutas para clientes */}
          
          <Route path="/registro-cliente" element={
            <PublicLayout>
              <RegisterCustomer />
            </PublicLayout>
          } />

          {/* Rutas protegidas para personal */}

          <Route path="/promociones" element={
            <PrivateRoute>
              <PromocionList />
            </PrivateRoute>
          } />


          <Route path="/promociones/editar/:id" element={
            <PrivateRoute adminOnly>
              <EditPromocion />
            </PrivateRoute>
          } />

          <Route path="/admin" element={
            <PrivateRoute adminOnly>
              <VehicleList />
            </PrivateRoute>
          } />

          <Route path="/admin/empleados/nuevo" element={
            <PrivateRoute adminOnly>
              <CreateEmployee />
            </PrivateRoute>
          } />

          <Route path="/mesero" element={
            <PrivateRoute>
              <VehicleList />
            </PrivateRoute>
          } />

          {/* Redirección para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;