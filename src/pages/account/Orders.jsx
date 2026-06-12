import { useState, useEffect } from 'react';
import { Search, ChevronRight, FileText, CheckCircle2, Clock, Truck, ShoppingBag, Loader2, AlertCircle, Download } from 'lucide-react';
import { getInvoicePdf, getProducts } from '../../services/api';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import './Orders.css';

const getMyOrders = () => api.get('/order/history');

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [downloadingId, setDownloadingId] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                
                const [ordersRes, productsRes] = await Promise.all([
                    getMyOrders(),
                    getProducts()
                ]);
                const data = Array.isArray(ordersRes.data) ? ordersRes.data : [];
                const productsList = Array.isArray(productsRes.data) ? productsRes.data : [];
                const productsMap = Object.fromEntries(productsList.map(p => [p.id, p]));

                const enrichedOrders = data.map(order => ({
                    ...order,
                    items: (order.items || []).map(item => ({
                        ...item,
                        title: productsMap[item.productId]?.title || item.title || t('cart.unknown_product', 'Unknown Product')
                    }))
                }));

                setOrders(enrichedOrders);
            } catch (err) {
                if (err.response?.status === 404) {
                    setOrders([]);
                } else {
                    console.error('Orders fetch error:', err);
                    setError(t('orders.error_load', 'Unable to load your orders. Please try again later.'));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [t, currentLang]);

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
            alert(err.response?.data?.error || t('orders.invoice_error', 'Unable to download invoice. The order may not be paid yet.'));
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

    const getStatusText = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'payé' || s === 'delivered') return t('orders.status_paid', 'Paid');
        if (s === 'shipped' || s === 'expédié') return t('orders.status_shipped', 'Shipped');
        return t('orders.status_pending', 'Pending');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const locale = i18n.language === 'fr' ? 'fr-FR' : (i18n.language === 'ru' ? 'ru-RU' : 'en-GB');
        return new Date(dateStr).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrderId(prev => prev === orderId ? null : orderId);
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
                   <h1 className="page-title">{t('orders.title', 'Order History')}</h1>
                   <p className="page-subtitle">{t('orders.subtitle', 'Track and manage your institutional equipment procurement.')}</p>
                </div>
                <div className="order-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder={t('orders.search_placeholder', 'Find order ID...')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </header>

            {loading && (
                <div className="orders-loading">
                    <Loader2 size={32} className="spin-icon" />
                    <p>{t('orders.loading', 'Loading your orders...')}</p>
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
                    <h3>{search ? t('orders.no_match', 'No orders match your search') : t('orders.no_orders', 'No orders yet')}</h3>
                    <p>{search ? t('orders.try_different', 'Try a different order ID.') : t('orders.empty_desc', 'Your completed orders will appear here after checkout.')}</p>
                </div>
            )}

            <div className="orders-list">
                {filtered.map(order => (
                    <div key={order.id} className="order-card-premium">
                        <div className="order-card-main-row">
                            <div className="order-main-info">
                                <div className="id-badge">#{order.id}</div>
                                <div className="order-details">
                                    <span className="date">{formatDate(order.paymentDate)}</span>
                                    <span className="items-count">
                                        • {order.items?.length ?? 0} {order.items?.length === 1 ? t('orders.items_count_one', 'Item') : t('orders.items_count_other', 'Items')}
                                    </span>
                                </div>
                            </div>

                            <div className="order-status-group">
                                <div className={`status-pill ${getStatusClass(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    {getStatusText(order.status)}
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
                                        title={t('orders.invoice_title', 'Download Invoice PDF')}
                                    >
                                        {downloadingId === order.id
                                            ? <Loader2 size={16} className="spin-icon" />
                                            : <Download size={16} />
                                        }
                                        {t('orders.invoice', 'Invoice')}
                                    </button>
                                )}
                                <button className="btn-view-order" onClick={() => toggleOrderDetails(order.id)}>
                                    <FileText size={18} />
                                    {expandedOrderId === order.id ? t('orders.hide_details', 'Hide') : t('orders.details', 'Details')}
                                    <ChevronRight size={14} className={`transition-transform duration-300 ${expandedOrderId === order.id ? 'rotate-90' : ''}`} />
                                </button>
                            </div>
                        </div>
                        
                        {expandedOrderId === order.id && (
                            <div className="order-expanded-details">
                                <div className="expanded-title">{t('orders.items_detail', 'Order Items')}</div>
                                <div className="items-table-wrapper">
                                    <table className="items-table">
                                        <thead>
                                            <tr>
                                                <th>{t('orders.product', 'Product')}</th>
                                                <th className="text-center">{t('orders.quantity', 'Quantity')}</th>
                                                <th className="text-right">{t('orders.unit_price', 'Unit Price')}</th>
                                                <th className="text-right">{t('orders.total', 'Total')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items?.map(item => (
                                                <tr key={item.id}>
                                                    <td className="product-cell">
                                                        <span className="product-title">{item.title}</span>
                                                    </td>
                                                    <td className="text-center qty-cell">{item.quantity}</td>
                                                    <td className="text-right price-cell">${Number(item.price).toLocaleString()}</td>
                                                    <td className="text-right total-cell">${(item.price * item.quantity).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
};

export default Orders;
