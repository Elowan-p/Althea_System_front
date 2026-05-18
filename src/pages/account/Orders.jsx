import { useState, useEffect } from 'react';
import { Search, ChevronRight, FileText, CheckCircle2, Clock, Truck, ShoppingBag, Loader2, AlertCircle, Download } from 'lucide-react';
import { getInvoicePdf } from '../../services/api';
import api from '../../services/api';

// Backend endpoint for completed orders history (ROLE_USER)
// Returns array of Orders where status !== 'cart'
const getMyOrders = () => api.get('/order/history');

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [downloadingId, setDownloadingId] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                // Try the dedicated orders endpoint — if it doesn't exist yet,
                // we fall back gracefully to an empty state.
                const res = await getMyOrders();
                const data = Array.isArray(res.data) ? res.data : [];
                setOrders(data);
            } catch (err) {
                if (err.response?.status === 404) {
                    // Endpoint not yet implemented — show empty state gracefully
                    setOrders([]);
                } else {
                    console.error('Orders fetch error:', err);
                    setError('Unable to load your orders. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleDownloadInvoice = async (orderId) => {
        setDownloadingId(orderId);
        try {
            const res = await getInvoicePdf(orderId);
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `facture-${orderId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Invoice download error:', err);
            alert(err.response?.data?.error || 'Unable to download invoice. The order may not be paid yet.');
        } finally {
            setDownloadingId(null);
        }
    };

    const getStatusIcon = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'payé' || s === 'delivered') return <CheckCircle2 size={16} className="text-success" />;
        if (s === 'shipped' || s === 'expédié') return <Truck size={16} className="text-primary" />;
        return <Clock size={16} className="text-warning" />;
    };

    const getStatusClass = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'payé' || s === 'delivered') return 'delivered';
        if (s === 'shipped' || s === 'expédié') return 'shipped';
        return 'processing';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const filtered = orders.filter(o =>
        !search.trim() ||
        String(o.id).includes(search.trim()) ||
        (o.status || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="orders-page">
            <header className="page-header-flex">
                <div>
                   <h1 className="page-title">Order History</h1>
                   <p className="page-subtitle">Track and manage your institutional equipment procurement.</p>
                </div>
                <div className="order-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Find order ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </header>

            {loading && (
                <div className="orders-loading">
                    <Loader2 size={32} className="spin-icon" />
                    <p>Loading your orders...</p>
                </div>
            )}

            {error && (
                <div className="orders-error">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {!loading && !error && filtered.length === 0 && (
                <div className="orders-empty">
                    <ShoppingBag size={64} strokeWidth={1} color="#cbd5e1" />
                    <h3>{search ? 'No orders match your search' : 'No orders yet'}</h3>
                    <p>{search ? 'Try a different order ID.' : 'Your completed orders will appear here after checkout.'}</p>
                </div>
            )}

            <div className="orders-list">
                {filtered.map(order => (
                    <div key={order.id} className="order-card-premium">
                        <div className="order-main-info">
                            <div className="id-badge">#{order.id}</div>
                            <div className="order-details">
                                <span className="date">{formatDate(order.paymentDate)}</span>
                                <span className="items-count">• {order.items?.length ?? 0} Items</span>
                            </div>
                        </div>

                        <div className="order-status-group">
                            <div className={`status-pill ${getStatusClass(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {order.status}
                            </div>
                        </div>

                        <div className="order-price">
                            ${Number(order.totalPrice || 0).toLocaleString()}
                        </div>

                        <div className="order-actions">
                            {(order.status?.toLowerCase() === 'payé') && (
                                <button
                                    className="btn-invoice"
                                    onClick={() => handleDownloadInvoice(order.id)}
                                    disabled={downloadingId === order.id}
                                    title="Download Invoice PDF"
                                >
                                    {downloadingId === order.id
                                        ? <Loader2 size={16} className="spin-icon" />
                                        : <Download size={16} />
                                    }
                                    Invoice
                                </button>
                            )}
                            <button className="btn-view-order">
                                <FileText size={18} />
                                Details
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .page-header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4rem; padding-bottom: 2rem; border-bottom: 2px solid #f8fafc; }
                .page-title { font-size: 2.2rem; font-weight: 900; color: #012a4a; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
                .page-subtitle { color: #64748b; font-size: 1rem; font-weight: 500; }
                .order-search { background: #f1f5f9; padding: 0.75rem 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 0.8rem; width: 300px; }
                .order-search input { background: transparent; border: none; outline: none; font-weight: 600; font-size: 0.9rem; width: 100%; }
                .orders-loading { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem; color: #64748b; font-weight: 700; }
                .orders-error { display: flex; align-items: center; gap: 0.8rem; background: #fef2f2; color: #b91c1c; padding: 1rem 1.5rem; border-radius: 12px; font-weight: 700; margin-bottom: 2rem; }
                .orders-empty { text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
                .orders-empty h3 { font-size: 1.4rem; font-weight: 800; color: #012a4a; }
                .orders-empty p { color: #64748b; }
                .orders-list { display: flex; flex-direction: column; gap: 1.5rem; }
                .order-card-premium {
                    display: grid;
                    grid-template-columns: 1fr 180px 150px 200px;
                    align-items: center;
                    padding: 2rem;
                    background: #fcfdfe;
                    border: 1px solid #f1f5f9;
                    border-radius: 20px;
                    transition: all 0.3s ease;
                }
                .order-card-premium:hover { transform: translateY(-4px); box-shadow: 0 15px 35px -10px rgba(0,0,0,0.08); border-color: var(--primary); }
                .id-badge { font-weight: 900; color: var(--primary); font-size: 1rem; margin-bottom: 0.4rem; }
                .order-details { font-size: 0.85rem; font-weight: 700; color: #94a3b8; }
                .status-pill { display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.6rem 1rem; border-radius: 10px; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
                .status-pill.processing { background: #fef3c7; color: #92400e; }
                .status-pill.shipped { background: #e0f2fe; color: #075985; }
                .status-pill.delivered { background: #dcfce7; color: #166534; }
                .order-price { font-weight: 900; color: #012a4a; font-size: 1.2rem; }
                .order-actions { display: flex; gap: 0.8rem; justify-content: flex-end; }
                .btn-view-order { display: flex; align-items: center; gap: 0.6rem; font-weight: 800; color: #64748b; background: white; border: 1px solid #e2e8f0; padding: 0.75rem 1rem; border-radius: 12px; transition: var(--transition); }
                .btn-view-order:hover { color: var(--primary); border-color: var(--primary); background: #f0f4f8; }
                .btn-invoice { display: flex; align-items: center; gap: 0.6rem; font-weight: 800; color: #059669; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 0.75rem 1rem; border-radius: 12px; transition: var(--transition); }
                .btn-invoice:hover { background: #dcfce7; }
                .btn-invoice:disabled { opacity: 0.6; cursor: wait; }
                .spin-icon { animation: spin 0.8s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .text-success { color: #10b981; }
                .text-primary { color: #0284c7; }
                .text-warning { color: #f59e0b; }
                @media (max-width: 1024px) {
                    .order-card-premium { grid-template-columns: 1fr; gap: 1.5rem; }
                    .page-header-flex { flex-direction: column; align-items: flex-start; gap: 2rem; }
                    .order-search { width: 100%; }
                    .order-actions { justify-content: flex-start; }
                }
            `}</style>
        </div>
    );
};

export default Orders;
