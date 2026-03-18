import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/common/Layout';
import Loader from './components/common/Loader';
import './i18n'; // Initialize i18n
import './index.css'; // Global CSS

// Lazy loading components for performance
const Home = lazy(() => import('./pages/Home'));
const Category = lazy(() => import('./pages/Category'));
const Product = lazy(() => import('./pages/Product'));
const Search = lazy(() => import('./pages/Search'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const AccountLayout = lazy(() => import('./pages/account/AccountLayout'));
const Orders = lazy(() => import('./pages/account/Orders'));
const Contact = lazy(() => import('./pages/Contact'));

// Component for protected routes
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Simplification for context
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/category/:id" element={<Category />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Private Routes */}
          <Route path="/account/*" element={
            <ProtectedRoute>
              <AccountLayout />
            </ProtectedRoute>
          }>
            <Route path="orders" element={<Orders />} />
          </Route>

          {/* Checkout (Open to guest or logged in) */}
          <Route path="/checkout" element={<Checkout />} />

          {/* Redirect all unknown to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Suspense>
  );
}

export default App;
