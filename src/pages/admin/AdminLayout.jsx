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
      <style>{`
        .admin-shell {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 2rem;
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 2rem 1.5rem 6rem;
          align-items: start;
          min-height: 80vh;
        }

        .admin-sidebar {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1.5rem;
          position: sticky;
          top: calc(var(--header-height) + 1.5rem);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .admin-brand { display: flex; align-items: center; gap: 0.9rem; padding: 0.5rem 0.5rem 1.25rem; border-bottom: 1px solid #f1f5f9; }
        .admin-brand-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; }
        .admin-brand h4 { font-size: 1rem; font-weight: 900; color: #012a4a; line-height: 1.2; }
        .admin-brand p { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }

        .admin-nav { display: flex; flex-direction: column; gap: 0.25rem; }
        .admin-nav a {
          display: flex; align-items: center; gap: 0.8rem;
          padding: 0.8rem 1rem; border-radius: 12px;
          font-weight: 700; font-size: 0.9rem; color: #475569;
          transition: var(--transition);
        }
        .admin-nav a:hover { background: #f8fafc; color: var(--primary); }
        .admin-nav a.active { background: var(--primary); color: white; box-shadow: 0 8px 16px -6px rgba(0, 92, 151, 0.4); }

        .admin-back-site {
          display: flex; align-items: center; gap: 0.8rem;
          padding: 0.9rem 1rem; border-top: 1px solid #f1f5f9;
          font-weight: 700; font-size: 0.9rem; color: #64748b;
        }
        .admin-back-site:hover { color: var(--primary); }

        .admin-content { min-width: 0; }

        /* ── Shared admin UI kit ── */
        .adm-page-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 2rem; }
        .adm-title { font-size: 1.8rem; font-weight: 900; color: #012a4a; letter-spacing: -0.02em; }
        .adm-sub { color: var(--text-muted); font-size: 0.95rem; font-weight: 500; margin-top: 0.25rem; }
        .adm-head-actions { display: flex; gap: 0.8rem; align-items: center; flex-wrap: wrap; }

        .adm-card { background: var(--white); border: 1px solid var(--border); border-radius: 18px; padding: 1.5rem; }

        .adm-toolbar { display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; margin-bottom: 1.25rem; }

        .adm-table-wrap { overflow-x: auto; background: var(--white); border: 1px solid var(--border); border-radius: 18px; }
        .adm-table { width: 100%; border-collapse: collapse; text-align: left; }
        .adm-table th {
          font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em;
          color: var(--text-muted); padding: 1rem 1.25rem; border-bottom: 1px solid var(--border);
          white-space: nowrap; background: #fcfdfe;
        }
        .adm-table th.sortable { cursor: pointer; user-select: none; }
        .adm-table th.sortable:hover { color: var(--primary); }
        .adm-table td { padding: 0.9rem 1.25rem; border-bottom: 1px solid #f8fafc; font-size: 0.9rem; font-weight: 600; color: #334155; vertical-align: middle; }
        .adm-table tbody tr:last-child td { border-bottom: none; }
        .adm-table tbody tr:hover { background: #fcfdfe; }
        .adm-row-link { cursor: pointer; }

        .adm-thumb { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; background: #f1f5f9; border: 1px solid var(--border); }

        .adm-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.65rem 1.1rem; border-radius: 10px;
          font-weight: 800; font-size: 0.85rem;
          background: white; color: #475569; border: 1px solid var(--border);
          transition: var(--transition); white-space: nowrap;
        }
        .adm-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
        .adm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .adm-btn.primary { background: var(--primary); color: white; border-color: var(--primary); }
        .adm-btn.primary:hover:not(:disabled) { background: #004a7c; color: white; box-shadow: 0 8px 16px -6px rgba(0, 92, 151, 0.4); }
        .adm-btn.danger { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
        .adm-btn.danger:hover:not(:disabled) { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
        .adm-btn.sm { padding: 0.45rem 0.75rem; font-size: 0.78rem; border-radius: 8px; }

        .adm-icon-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 8px;
          background: white; border: 1px solid var(--border); color: #64748b;
          transition: var(--transition);
        }
        .adm-icon-btn:hover:not(:disabled) { color: var(--primary); border-color: var(--primary); }
        .adm-icon-btn.danger:hover:not(:disabled) { color: #b91c1c; border-color: #fca5a5; background: #fef2f2; }
        .adm-icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .adm-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.3rem 0.7rem; border-radius: 99px;
          font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em;
          background: #f1f5f9; color: #475569;
        }
        .adm-badge.green { background: #dcfce7; color: #166534; }
        .adm-badge.amber { background: #fef3c7; color: #92400e; }
        .adm-badge.red { background: #fee2e2; color: #b91c1c; }
        .adm-badge.blue { background: #e0f2fe; color: #075985; }

        .adm-field { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem; }
        .adm-label { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; }
        .adm-input, .adm-select, .adm-textarea {
          width: 100%; padding: 0.75rem 1rem; border-radius: 10px;
          border: 1.5px solid var(--border); background: white;
          font-weight: 600; font-size: 0.9rem; font-family: inherit; color: var(--text-main);
          transition: var(--transition);
        }
        .adm-input:focus, .adm-select:focus, .adm-textarea:focus {
          border-color: var(--primary); box-shadow: 0 0 0 4px rgba(0, 92, 151, 0.08); outline: none;
        }
        .adm-textarea { resize: vertical; min-height: 110px; }
        .adm-check { display: flex; align-items: center; gap: 0.6rem; font-size: 0.88rem; font-weight: 700; color: #475569; cursor: pointer; }
        .adm-check input { width: 17px; height: 17px; accent-color: var(--primary); cursor: pointer; }

        .adm-lang-tabs { display: inline-flex; background: #f1f5f9; border-radius: 10px; padding: 4px; gap: 4px; }
        .adm-lang-tab { padding: 0.45rem 1rem; border-radius: 8px; font-weight: 800; font-size: 0.8rem; color: #64748b; text-transform: uppercase; }
        .adm-lang-tab.active { background: white; color: var(--primary); box-shadow: var(--shadow); }

        .adm-loading { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem; color: var(--text-muted); font-weight: 700; }
        .adm-error { display: flex; align-items: center; gap: 0.8rem; background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 1rem 1.25rem; border-radius: 12px; font-weight: 700; font-size: 0.9rem; margin-bottom: 1.5rem; }
        .adm-success { display: flex; align-items: center; gap: 0.8rem; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 1rem 1.25rem; border-radius: 12px; font-weight: 700; font-size: 0.9rem; margin-bottom: 1.5rem; }
        .adm-empty { text-align: center; padding: 4rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; color: var(--text-muted); }
        .adm-empty h3 { font-size: 1.2rem; font-weight: 800; color: #012a4a; }

        .adm-spin { animation: adm-spin 0.8s linear infinite; }
        @keyframes adm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .adm-modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; padding: 1.5rem;
        }
        .adm-modal {
          background: white; border-radius: 20px; padding: 2rem;
          width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto;
          box-shadow: var(--shadow-lg);
          animation: adm-pop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .adm-modal h3 { font-size: 1.25rem; font-weight: 900; color: #012a4a; margin-bottom: 0.75rem; }
        .adm-modal p { color: var(--text-muted); font-size: 0.92rem; margin-bottom: 1.5rem; }
        .adm-modal-actions { display: flex; justify-content: flex-end; gap: 0.8rem; }
        @keyframes adm-pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        .adm-pagination { display: flex; align-items: center; justify-content: flex-end; gap: 1rem; margin-top: 1.25rem; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); }

        @media (max-width: 1024px) {
          .admin-shell { grid-template-columns: 1fr; gap: 1.5rem; }
          .admin-sidebar { position: static; }
          .admin-nav { flex-direction: row; flex-wrap: wrap; }
          .admin-nav a { padding: 0.6rem 0.9rem; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
