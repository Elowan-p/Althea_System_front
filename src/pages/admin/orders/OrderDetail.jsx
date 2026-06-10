import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Loader2, AlertCircle, Download, MapPin, CreditCard,
  User, CheckCircle2, RefreshCw
} from 'lucide-react';
import { getAdminOrder, updateOrderStatus, getInvoicePdf, getAdminProducts } from '../../../services/api';

const STATUS_OPTIONS = ['cart', 'Payé', 'shipped', 'delivered', 'cancelled'];

const statusBadge = (status) => {
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
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
};

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [productsMap, setProductsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [orderRes, productsRes] = await Promise.all([
        getAdminOrder(id),
        getAdminProducts().catch(() => ({ data: [] })),
      ]);
      const data = orderRes.data || {};
      setOrder(data);
      setNewStatus(data.status || '');
      const list = Array.isArray(productsRes.data) ? productsRes.data : [];
      setProductsMap(Object.fromEntries(list.map((p) => [p.id, p])));
    } catch (err) {
      console.error('Order detail fetch error:', err);
      setError('Impossible de charger la commande.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order?.status) return;
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      await updateOrderStatus(id, newStatus);
      setSuccess(`Statut mis à jour : ${newStatus}`);
      await fetchOrder();
    } catch (err) {
      console.error('Status update error:', err);
      setError('La mise à jour du statut a échoué.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    setError('');
    try {
      const res = await getInvoicePdf(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Invoice download error:', err);
      setError('Téléchargement de la facture impossible (la commande doit être payée).');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="adm-loading">
        <Loader2 size={32} className="adm-spin" />
        <p>Chargement de la commande...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <Link to="/admin/orders" className="back-link"><ArrowLeft size={15} /> Retour aux commandes</Link>
        <div className="adm-error" style={{ marginTop: '1rem' }}>
          <AlertCircle size={18} />
          <span>{error || 'Commande introuvable.'}</span>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const user = order.user || {};
  const statusOptions = [...new Set([...STATUS_OPTIONS, order.status].filter(Boolean))];
  const last4 = order.payment?.last4 || order.cardLast4 || order.last4 || null;
  const addressParts = [
    order.address || user.address,
    order.additionalAddress || user.additionalAddress,
    [order.postalCode || user.postalCode, order.city || user.city].filter(Boolean).join(' '),
    order.country || user.country,
  ].filter(Boolean);

  return (
    <div className="order-detail-page">
      <header className="adm-page-head">
        <div>
          <Link to="/admin/orders" className="back-link">
            <ArrowLeft size={15} /> Retour aux commandes
          </Link>
          <h1 className="adm-title">
            Commande #{order.id}{' '}
            <span className={`adm-badge ${statusBadge(order.status)}`}>{order.status || '—'}</span>
          </h1>
          <p className="adm-sub">Passée le {formatDate(order.paymentDate || order.createdAt || order.date)}</p>
        </div>
        <div className="adm-head-actions">
          <button className="adm-btn" onClick={handleDownloadInvoice} disabled={downloading}>
            {downloading ? <Loader2 size={16} className="adm-spin" /> : <Download size={16} />}
            Facture PDF
          </button>
        </div>
      </header>

      {error && (
        <div className="adm-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="adm-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="detail-grid">
        <div className="detail-main">
          <div className="adm-card">
            <h2 className="card-title">Articles commandés</h2>
            {items.length === 0 ? (
              <div className="adm-empty"><p>Aucun article dans cette commande.</p></div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th style={{ textAlign: 'center' }}>Quantité</th>
                      <th style={{ textAlign: 'right' }}>Prix unitaire</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const product = productsMap[item.productId];
                      const title = item.title || product?.title || `Produit #${item.productId ?? '?'}`;
                      const unitPrice = Number(item.price) || 0;
                      const qty = Number(item.quantity) || 0;
                      return (
                        <tr key={item.id ?? idx}>
                          <td>
                            <div className="item-cell">
                              {product?.pictureUrl && (
                                <img src={product.pictureUrl} alt={title} className="adm-thumb" />
                              )}
                              <span className="item-name">{title}</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>{qty}</td>
                          <td style={{ textAlign: 'right' }}>{unitPrice.toLocaleString('fr-FR')} €</td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: '#012a4a' }}>
                            {(unitPrice * qty).toLocaleString('fr-FR')} €
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 900, color: '#012a4a' }}>
                        Total commande
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 900, color: 'var(--primary)', fontSize: '1.05rem' }}>
                        {Number(order.totalPrice || 0).toLocaleString('fr-FR')} €
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="detail-side">
          <div className="adm-card">
            <h2 className="card-title"><RefreshCw size={16} /> Changer le statut</h2>
            <div className="adm-field">
              <label className="adm-label">Nouveau statut</label>
              <select className="adm-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button
              className="adm-btn primary"
              style={{ width: '100%' }}
              disabled={updating || !newStatus || newStatus === order.status}
              onClick={handleStatusUpdate}
            >
              {updating ? <Loader2 size={16} className="adm-spin" /> : <CheckCircle2 size={16} />}
              Confirmer le changement
            </button>
          </div>

          <div className="adm-card">
            <h2 className="card-title"><User size={16} /> Client</h2>
            <div className="meta-list">
              <div className="meta-row">
                <span>Nom</span>
                <strong>{[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}</strong>
              </div>
              <div className="meta-row">
                <span>Email</span>
                <strong>{user.email || order.userEmail || '—'}</strong>
              </div>
              <div className="meta-row">
                <span>Référence</span>
                <strong>{order.userId != null ? `#${order.userId}` : '—'}</strong>
              </div>
            </div>
          </div>

          <div className="adm-card">
            <h2 className="card-title"><MapPin size={16} /> Adresse de livraison</h2>
            {addressParts.length > 0 ? (
              <div className="address-block">
                {addressParts.map((part, i) => <p key={i}>{part}</p>)}
              </div>
            ) : (
              <p className="muted-note">Adresse non renseignée.</p>
            )}
          </div>

          <div className="adm-card">
            <h2 className="card-title"><CreditCard size={16} /> Paiement</h2>
            <div className="meta-list">
              <div className="meta-row">
                <span>Carte</span>
                <strong>{last4 ? `•••• •••• •••• ${last4}` : '—'}</strong>
              </div>
              <div className="meta-row">
                <span>Date de paiement</span>
                <strong>{formatDate(order.paymentDate)}</strong>
              </div>
              {order.promo != null && (
                <div className="meta-row">
                  <span>Promo</span>
                  <strong>{String(order.promo)}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .back-link { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 800; color: var(--text-muted); margin-bottom: 0.5rem; }
        .back-link:hover { color: var(--primary); }

        .order-detail-page .adm-title { display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; }

        .detail-grid { display: grid; grid-template-columns: 1fr 360px; gap: 1.5rem; align-items: start; }
        .detail-main, .detail-side { display: flex; flex-direction: column; gap: 1.5rem; min-width: 0; }

        .card-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; font-weight: 850; color: #012a4a; margin-bottom: 1.25rem; }

        .item-cell { display: flex; align-items: center; gap: 0.8rem; }
        .item-name { font-weight: 750; color: #1e293b; }

        .meta-list { display: flex; flex-direction: column; gap: 0.9rem; }
        .meta-row { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; font-size: 0.88rem; }
        .meta-row span { color: var(--text-muted); font-weight: 600; }
        .meta-row strong { color: #1e293b; font-weight: 800; text-align: right; word-break: break-all; }

        .address-block p { font-size: 0.9rem; font-weight: 650; color: #334155; line-height: 1.7; }
        .muted-note { font-size: 0.88rem; color: var(--text-muted); font-weight: 600; }

        @media (max-width: 1200px) {
          .detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default OrderDetail;
