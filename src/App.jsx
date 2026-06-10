import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/common/Layout';
import Loader from './components/common/Loader';
import LogoutLoader from './components/common/LogoutLoader';
import AccountLayout from './pages/account/AccountLayout';
import Orders from './pages/account/Orders';
import Settings from './pages/account/Settings';
import './index.css';

const Home = lazy(() => import('./pages/Home'));
const Category = lazy(() => import('./pages/Category'));
const Product = lazy(() => import('./pages/Product'));
const Search = lazy(() => import('./pages/Search'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Catalogue = lazy(() => import('./pages/Catalogue'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const Contact = lazy(() => import('./pages/Contact'));
const Cancel = lazy(() => import('./pages/Cancel'));

// Lazy loading admin backoffice pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductList = lazy(() => import('./pages/admin/products/ProductList'));
const ProductForm = lazy(() => import('./pages/admin/products/ProductForm'));
const CategoryList = lazy(() => import('./pages/admin/categories/CategoryList'));
const CategoryForm = lazy(() => import('./pages/admin/categories/CategoryForm'));
const OrderList = lazy(() => import('./pages/admin/orders/OrderList'));
const OrderDetail = lazy(() => import('./pages/admin/orders/OrderDetail'));
const ContactList = lazy(() => import('./pages/admin/contacts/ContactList'));
const ContactDetail = lazy(() => import('./pages/admin/contacts/ContactDetail'));
const HomepageManager = lazy(() => import('./pages/admin/homepage/HomepageManager'));
const TwoFA = lazy(() => import('./pages/admin/auth/TwoFA'));

// Component for protected routes
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin routes: JWT + ROLE_ADMIN + 2FA verification required
const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch { /* corrupted storage — treated as not admin */ }
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  if (!token || !isAdmin) return <Navigate to="/login" replace />;
  if (!localStorage.getItem('adminTwoFaVerified')) return <Navigate to="/admin/2fa" replace />;
  return children;
};

function App() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogoutStart = () => {
      setIsLoggingOut(true);
      
      // Clean up authentication storage during animation
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('authchange'));
        window.dispatchEvent(new Event('cartchange'));
      }, 1400);

      // Navigate to homepage and close overlay
      setTimeout(() => {
        navigate('/', { replace: true });
        setIsLoggingOut(false);
      }, 2000);
    };

    window.addEventListener('logout-start', handleLogoutStart);
    return () => window.removeEventListener('logout-start', handleLogoutStart);
  }, [navigate]);

  return (
    <>
      {isLoggingOut && <LogoutLoader />}
      <Suspense fallback={<Loader />}>
        <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/category/:id" element={<Category />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/search" element={<Search />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route path="/account" element={
            <ProtectedRoute>
              <AccountLayout />
            </ProtectedRoute>
          }>
              <Route path="settings" element={<Settings />} />
              <Route path="orders" element={<Orders />} />
              <Route index element={<Settings />} />
          </Route>

          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin Backoffice Routes */}
          <Route path="/admin/2fa" element={<TwoFA />} />
          <Route path="/admin" element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="categories" element={<CategoryList />} />
            <Route path="categories/new" element={<CategoryForm />} />
            <Route path="categories/:id" element={<CategoryForm />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="contacts" element={<ContactList />} />
            <Route path="contacts/:id" element={<ContactDetail />} />
            <Route path="homepage" element={<HomepageManager />} />
          </Route>

          {/* Redirect all unknown to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Suspense>
    </>
  );
}

export default App;
