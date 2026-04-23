import { Search, ChevronRight, FileText, CheckCircle2, Clock, Truck } from 'lucide-react';

const Orders = () => {
    const orders = [
        { id: 'ORD-2026-8812', date: 'March 14, 2026', total: 12450.00, status: 'Processing', items: 3 },
        { id: 'ORD-2026-7754', date: 'March 10, 2026', total: 820.50, status: 'Shipped', items: 12 },
        { id: 'ORD-2026-6621', date: 'Feb 28, 2026', total: 45000.00, status: 'Delivered', items: 1 },
    ];

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Delivered': return <CheckCircle2 size={16} className="text-success" />;
            case 'Shipped': return <Truck size={16} className="text-primary" />;
            default: return <Clock size={16} className="text-warning" />;
        }
    };

    return (
        <div className="orders-page">
            <header className="page-header-flex">
                <div>
                   <h1 className="page-title">Order History</h1>
                   <p className="page-subtitle">Track and manage your institutional equipment procurement.</p>
                </div>
                <div className="order-search">
                    <Search size={18} />
                    <input type="text" placeholder="Find order ID..." />
                </div>
            </header>

            <div className="orders-list">
                {orders.map(order => (
                    <div key={order.id} className="order-card-premium">
                        <div className="order-main-info">
                            <div className="id-badge">#{order.id}</div>
                            <div className="order-details">
                                <span className="date">{order.date}</span>
                                <span className="items-count">• {order.items} Items</span>
                            </div>
                        </div>

                        <div className="order-status-group">
                            <div className={`status-pill ${order.status.toLowerCase()}`}>
                                {getStatusIcon(order.status)}
                                {order.status}
                            </div>
                        </div>

                        <div className="order-price">
                            ${order.total.toLocaleString()}
                        </div>

                        <button className="btn-view-order">
                            <FileText size={18} />
                            Details
                            <ChevronRight size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <style>{`
                .page-header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4rem; padding-bottom: 2rem; border-bottom: 2px solid #f8fafc; }
                .page-title { font-size: 2.2rem; font-weight: 900; color: #012a4a; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
                .page-subtitle { color: #64748b; font-size: 1rem; font-weight: 500; }

                .order-search { background: #f1f5f9; padding: 0.75rem 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 0.8rem; width: 300px; }
                .order-search input { background: transparent; border: none; outline: none; font-weight: 600; font-size: 0.9rem; }

                .orders-list { display: flex; flex-direction: column; gap: 1.5rem; }
                .order-card-premium { 
                    display: grid; 
                    grid-template-columns: 1fr 180px 150px 140px; 
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
                
                .btn-view-order { display: flex; align-items: center; gap: 0.6rem; font-weight: 800; color: #64748b; background: white; border: 1px solid #e2e8f0; padding: 0.75rem 1rem; border-radius: 12px; transition: var(--transition); }
                .btn-view-order:hover { color: var(--primary); border-color: var(--primary); background: #f0f4f8; }

                .text-success { color: #10b981; }
                .text-primary { color: #0284c7; }
                .text-warning { color: #f59e0b; }

                @media (max-width: 1024px) {
                    .order-card-premium { grid-template-columns: 1fr; gap: 1.5rem; }
                    .page-header-flex { flex-direction: column; align-items: flex-start; gap: 2rem; }
                    .order-search { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default Orders;
