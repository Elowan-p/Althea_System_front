import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Loader from '../components/common/Loader';
import { 
  Trash2, 
  Minus, 
  Plus, 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  Truck,
  ShoppingBag
} from 'lucide-react';

const Cart = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    
    // Mock Cart State (Simulation of premium sync)
    const [items, setItems] = useState([
        {
          id: 1,
          name: 'Advanced Scanner X-100',
          price: 12500,
          quantity: 1,
          category: 'Diagnostics',
          image: '/images/prod_scanner.png'
        },
        {
          id: 2,
          name: 'Surgical Laser Pro',
          price: 8900,
          quantity: 2,
          category: 'Surgical Equipment',
          image: '/images/cat_surgical.png'
        }
    ]);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 900);
        return () => clearTimeout(timer);
    }, []);

    const updateQuantity = (id, delta) => {
        setItems(curr => curr.map(item => 
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ));
    };

    const removeItem = (id) => {
        setItems(curr => curr.filter(item => item.id !== id));
    };

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.20; // 20% VAT
    const total = subtotal + tax;

    if (loading) return <Loader />;

    if (items.length === 0) {
        return (
          <div className="empty-cart-view transition-in">
            <div className="container">
              <div className="empty-wrap">
                <ShoppingBag size={80} strokeWidth={1} color="var(--text-muted)" />
                <h2>Your medical cart is empty</h2>
                <p>Ready to upgrade your infrastructure? Browse our latest solutions.</p>
                <NavLink to="/search" className="btn-primary">Browse Catalogue</NavLink>
              </div>
            </div>
          </div>
        );
    }

    return (
        <div className="cart-page backdrop">
          <div className="container">
            <div className="cart-header">
              <h1>{t('header.cart')}</h1>
              <NavLink to="/" className="back-link"><ArrowLeft size={16} /> Continue Shopping</NavLink>
            </div>

            <div className="cart-layout">
              {/* Main List */}
              <div className="cart-items-list card">
                <div className="list-labels">
                  <span>Equipment</span>
                  <span>Quantity</span>
                  <span>Price</span>
                </div>
                {items.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-main">
                      <div className="item-img"><img src={item.image} alt={item.name} /></div>
                      <div className="item-meta">
                        <h4>{item.name}</h4>
                        <span className="item-cat">{item.category}</span>
                        <button className="remove-btn" onClick={() => removeItem(item.id)}>
                          <Trash2 size={16} /> Remove
                        </button>
                      </div>
                    </div>
                    
                    <div className="item-qty">
                      <div className="qty-control">
                        <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                      </div>
                    </div>

                    <div className="item-price">
                      <span className="unit-price">${(item.price * item.quantity).toLocaleString()}</span>
                      <small className="unit-ref">${item.price.toLocaleString()} / unit</small>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sticky Summary */}
              <aside className="cart-summary sticky-aside">
                <div className="summary-card card">
                  <h3>Order Summary</h3>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Estimated Tax (VAT 20%)</span>
                    <span>${tax.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Global Shipping</span>
                    <span className="free">FREE</span>
                  </div>
                  <div className="divider" />
                  <div className="total-row">
                    <span>Total Amount</span>
                    <span>${total.toLocaleString()}</span>
                  </div>

                  <NavLink to="/checkout" className="checkout-btn">
                    <CreditCard size={18} /> Proceed to Order
                  </NavLink>

                  <div className="security-badges">
                    <div className="badge"><ShieldCheck size={16} /> Secure checkout</div>
                    <div className="badge"><Truck size={16} /> Priority medical handling</div>
                  </div>
                </div>

                <div className="promo-box card">
                  <h4>Institutional Quote</h4>
                  <p>Need a custom quote for a hospital cluster?</p>
                  <button className="quote-btn">Request B2B Quote</button>
                </div>
              </aside>
            </div>
          </div>

          <style>{`
            .cart-page { padding: 4rem 0 8rem; }
            .cart-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 2.5rem; }
            .cart-header h1 { font-size: 2.5rem; font-weight: 800; color: var(--primary); }
            .back-link { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-weight: 600; font-size: 0.9rem; }
            .back-link:hover { color: var(--primary); }

            .cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: 2.5rem; align-items: start; }

            /* Item List */
            .cart-items-list { padding: 0 !important; overflow: hidden; }
            .list-labels { display: grid; grid-template-columns: 1.5fr 1fr 1fr; padding: 1rem 2rem; background: var(--background); font-weight: 700; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; border-bottom: 1px solid var(--border); }
            .cart-item { display: grid; grid-template-columns: 1.5fr 1fr 1fr; padding: 2rem; align-items: center; border-bottom: 1px solid var(--border); transition: var(--transition); }
            .cart-item:last-child { border-bottom: none; }
            .cart-item:hover { background: #fafafa; }

            .item-main { display: flex; gap: 1.5rem; align-items: center; }
            .item-img { width: 100px; height: 100px; background: var(--background); border-radius: 12px; padding: 0.5rem; display: flex; align-items: center; justify-content: center; }
            .item-img img { max-width: 100%; max-height: 100%; object-fit: contain; }
            .item-meta h4 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.3rem; }
            .item-cat { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.02em; }
            .remove-btn { display: flex; align-items: center; gap: 0.4rem; color: #ef4444; font-size: 0.8rem; font-weight: 600; margin-top: 0.8rem; }

            .qty-control { display: inline-flex; align-items: center; background: white; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
            .qty-control button { padding: 0.6rem 0.8rem; color: var(--primary); }
            .qty-control span { width: 40px; text-align: center; font-weight: 700; }

            .item-price { text-align: right; display: flex; flex-direction: column; }
            .unit-price { font-size: 1.25rem; font-weight: 800; color: var(--primary); }
            .unit-ref { font-size: 0.75rem; color: var(--text-muted); }

            /* Summary */
            .summary-card { padding: 2rem; }
            .summary-card h3 { font-size: 1.4rem; font-weight: 800; margin-bottom: 1.5rem; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.95rem; font-weight: 500; color: var(--text-muted); }
            .free { color: #10b981; font-weight: 800; }
            .divider { height: 1px; background: var(--border); margin: 1.5rem 0; }
            .total-row { display: flex; justify-content: space-between; align-items: baseline; font-weight: 900; font-size: 1.5rem; margin-bottom: 2rem; color: var(--primary); }

            .checkout-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.8rem; padding: 1rem; background: var(--primary); color: white; border-radius: 12px; font-weight: 700; font-size: 1rem; margin-bottom: 2rem; transition: var(--transition); }
            .checkout-btn:hover { background: #004b7c; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0, 92, 151, 0.2); }

            .security-badges { display: flex; flex-direction: column; gap: 0.8rem; }
            .badge { display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
            .badge svg { color: #10b981; }

            .promo-box { margin-top: 1.5rem; padding: 1.5rem; text-align: center; }
            .promo-box h4 { margin-bottom: 0.5rem; font-weight: 800; }
            .promo-box p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.2rem; }
            .quote-btn { width: 100%; border: 1px solid var(--primary); color: var(--primary); border-radius: 10px; padding: 0.7rem; font-weight: 700; font-size: 0.9rem; }

            /* Empty State */
            .empty-cart-view { padding: 8rem 0; text-align: center; }
            .empty-wrap { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; max-width: 400px; margin: 0 auto; }
            .empty-wrap h2 { font-size: 2rem; color: var(--primary); }
            .empty-wrap p { color: var(--text-muted); margin-bottom: 1rem; }

            @media (max-width: 1024px) {
              .cart-layout { grid-template-columns: 1fr; }
              .list-labels { display: none; }
              .cart-item { grid-template-columns: 1fr; gap: 1.5rem; }
              .item-price { text-align: left; }
              .sticky-aside { position: static; }
            }
          `}</style>
        </div>
    );
};

export default Cart;
极
