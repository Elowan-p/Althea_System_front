import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, ShoppingCart, Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { getAdminOrders } from '../../../services/api';

const PAGE_SIZE = 20;
const DEFAULT_STATUSES = ['cart', 'Payé', 'shipped', 'delivered', 'cancelled'];

const orderStatusBadge = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'payé' || s === 'paye' || s === 'paid' || s === 'delivered' || s === 'livré') return 'green';
  if (s === 'shipped' || s === 'expédié' || s === 'expedie') return 'blue';
  if (s === 'cancelled' || s === 'annulé' || s === 'annule') return 'red';
  if (s === 'cart' || s === 'panier') return '';
  return 'amber';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
};

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [seenStatuses, setSeenStatuses] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const params = { limit: PAGE_SIZE, offset: page * PAGE_SIZE };
        if (statusFilter) params.status = statusFilter;
        const res = await getAdminOrders(params);
        if (cancelled) return;
        const data = Array.isArray(res.data) ? res.data : [];
        setOrders(data);
        setSeenStatuses((prev) => {
          const merged = new Set(prev);
          data.forEach((o) => o.status && merged.add(o.status));
          return [...merged];
        });
      } catch (err) {
        if (!cancelled) {
          console.error('Admin orders fetch error:', err);
          setError('Impossible de charger les commandes.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchOrders();
    return () => { cancelled = true; };
  }, [statusFilter, page]);

  const statusOptions = useMemo(() => {
    const set = new Set([...DEFAULT_STATUSES, ...seenStatuses]);
    return [...set];
  }, [seenStatuses]);

  const customerLabel = (order) =>
    order.user?.email || order.userEmail || (order.userId != null ? `Client #${order.userId}` : '—');

  return (
    <div className="order-list-page">
      <header className="adm-page-head">
        <div>
          <h1 className="adm-title">Commandes</h1>
          <p className="adm-sub">Suivi et gestion des commandes clients</p>
        </div>
      </header>

      <div className="adm-toolbar">
        <Filter size={16} color="#94a3b8" />
        <select
          className="adm-select"
          style={{ width: 220 }}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
        >
          <option value="">Tous les statuts</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="adm-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="adm-loading">
          <Loader2 size={32} className="adm-spin" />
          <p>Chargement des commandes...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="adm-empty">
          <ShoppingCart size={56} strokeWidth={1} color="#cbd5e1" />
          <h3>Aucune commande</h3>
          <p>{statusFilter ? 'Aucune commande pour ce statut.' : 'Les commandes apparaîtront ici.'}</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Commande</th>
                <th>Client</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Total</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link to={`/admin/orders/${order.id}`} className="order-id-link">#{order.id}</Link>
                  </td>
                  <td>{customerLabel(order)}</td>
                  <td>{formatDate(order.paymentDate || order.createdAt || order.date)}</td>
                  <td>
                    <span className={`adm-badge ${orderStatusBadge(order.status)}`}>
                      {order.status || '—'}
                    </span>
                  </td>
                  <td className="cell-total">{Number(order.totalPrice || 0).toLocaleString('fr-FR')} €</td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/admin/orders/${order.id}`} className="adm-icon-btn" title="Voir le détail">
                        <Eye size={15} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="adm-pagination">
        <span>Page {page + 1}</span>
        <button className="adm-icon-btn" disabled={page === 0 || loading} onClick={() => setPage((p) => p - 1)}>
          <ChevronLeft size={16} />
        </button>
        <button
          className="adm-icon-btn"
          disabled={orders.length < PAGE_SIZE || loading}
          onClick={() => setPage((p) => p + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <style>{`
        .order-id-link { font-weight: 900; color: var(--primary); }
        .cell-total { font-weight: 800; color: #012a4a; white-space: nowrap; }
        .row-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
      `}</style>
    </div>
  );
};

export default OrderList;
