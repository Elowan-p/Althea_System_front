import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, PlusCircle, LayoutDashboard } from 'lucide-react';

const AdminLayout = () => {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-logo">A</div>
          <div>
            <div className="admin-title">ALTHEA</div>
            <div className="admin-subtitle">Backoffice</div>
          </div>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin" end><LayoutDashboard size={18} /> Produits</NavLink>
          <NavLink to="/admin/products/new"><PlusCircle size={18} /> Nouveau produit</NavLink>
          <NavLink to="/admin/data"><BarChart3 size={18} /> Data</NavLink>
        </nav>
      </aside>

      <div className="admin-content">
        <Outlet />
      </div>

      <style>{`
        .admin-shell { display: grid; grid-template-columns: 280px 1fr; min-height: 100vh; background: #f8fafc; }
        .admin-sidebar { background: #0f172a; color: white; padding: 2rem 1.25rem; position: sticky; top: 0; height: 100vh; }
        .admin-brand { display: flex; align-items: center; gap: 0.9rem; margin-bottom: 2rem; }
        .admin-logo { width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; background: #2563eb; font-weight: 900; }
        .admin-title { font-weight: 800; letter-spacing: 0.12em; }
        .admin-subtitle { color: #94a3b8; font-size: 0.85rem; }
        .admin-nav { display: flex; flex-direction: column; gap: 0.6rem; }
        .admin-nav a { display: flex; align-items: center; gap: 0.75rem; padding: 0.9rem 1rem; border-radius: 12px; color: #cbd5e1; text-decoration: none; }
        .admin-nav a.active { background: rgba(37,99,235,0.18); color: white; }
        .admin-content { padding: 2rem; }
        @media (max-width: 900px) { .admin-shell { grid-template-columns: 1fr; } .admin-sidebar { position: static; height: auto; } }
      `}</style>
    </div>
  );
};

export default AdminLayout;
