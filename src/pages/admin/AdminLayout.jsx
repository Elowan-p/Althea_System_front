import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Mail,
  GalleryHorizontal,
  Home,
  ArrowLeft,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Produits', icon: Package },
  { to: '/admin/categories', label: 'Catégories', icon: Layers },
  { to: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
  { to: '/admin/contacts', label: 'Messages', icon: Mail },
  { to: '/admin/chatbot', label: 'Chatbot', icon: MessageSquare },
  { to: '/admin/homepage', label: "Page d'accueil", icon: Home },
];

const AdminLayout = () => {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon"><ShieldCheck size={22} /></div>
          <div>
            <h4>Backoffice</h4>
            <p>Althea Systems</p>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <Link to="/" className="admin-back-site">
          <ArrowLeft size={18} />
          <span>Retour au site</span>
        </Link>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>

      {}
      
    </div>
  );
};

export default AdminLayout;
