import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import VehicleList from './components/VehicleList';
import PromocionList from './components/PromocionList'; // 1. Importa el componente
import Logout from './components/Auth/Logout';
import Navbar from './components/Navbar';
import CreateEmployee from './components/Auth/CreateEmployee';

const PrivateLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="pt-16">
      {children}
    </main>
  </>
);

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.is_admin) return <Navigate to="/" replace />;

  return <PrivateLayout>{children}</PrivateLayout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

          {/* 2. Nueva ruta para promociones (accesible para todos los usuarios autenticados) */}
          <Route path="/promociones" element={
            <PrivateRoute>
              <PromocionList />
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

          <Route path="/" element={
            <PrivateRoute>
              {({ user }) => user?.is_admin ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/mesero" replace />
              )}
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;