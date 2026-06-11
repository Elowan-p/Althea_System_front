import { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader/Loader';
import {
  Trash2, Minus, Plus, ArrowLeft, CreditCard, ShieldCheck, Truck,
  ShoppingBag, LogIn, AlertTriangle, RefreshCw
} from 'lucide-react';
import { getMyCart, updateCartItems, removeCartItem, getProducts } from '../../services/api';
import './Cart.css';

const Cart = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);
    const [isGuest, setIsGuest] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const currentLang = i18n.language;

    const enrichItems = useCallback(async (rawItems) => {
        try {
            const productsRes = await getProducts();
            const productsMap = Object.fromEntries(
                (productsRes.data || []).map(p => [p.id, p])
            );
            return rawItems.map(item => {
                const product = productsMap[item.productId] || {};
                
                return {
                    ...item,
                    itemId: item.itemId ?? item.id ?? null,
                    name: product.title || item.title || t('cart.unknown_product', 'Unknown Product'),
                    image: product.pictureUrl || null,
                    category: product.category?.title || '',
                };
            });
        } catch {
            return rawItems.map(item => ({ ...item, name: item.title || t('cart.unknown_product', 'Unknown Product') }));
        }
    }, [t]);

    const fetchCart = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getMyCart();
            const data = res.data;
            const hasToken = !!localStorage.getItem('token');
            setIsGuest(!hasToken);

            if (!data || (!Array.isArray(data.items) && typeof data.items !== 'object')) {
                setItems([]);
                return;
            }

            if (hasToken && Array.isArray(data.items)) {
                
                const enriched = await enrichItems(data.items);
                setItems(enriched);
            } else if (!hasToken && data.items && typeof data.items === 'object') {
                
                const productsRes = await getProducts();
                const productsMap = Object.fromEntries(
                    (productsRes.data || []).map(p => [p.id, p])
                );
                const guestItems = Object.entries(data.items).map(([productId, quantity]) => {
                    const product = productsMap[parseInt(productId)] || {};
                    return {
                        itemId: null, 
                        productId: parseInt(productId),
                        quantity,
                        name: product.title || t('cart.product_placeholder', { id: productId, defaultValue: 'Product #{{id}}' }),
                        price: product.price || 0,
                        image: product.pictureUrl || null,
                        category: product.category?.title || '',
                    };
                });
                setItems(guestItems);
            } else {
                setItems([]);
            }
        } catch (err) {
            console.error('Cart fetch error:', err);
            setError(t('cart.error_load', 'Unable to load your cart. Please try again.'));
        } finally {
            setLoading(false);
        }
    }, [t, enrichItems]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart, currentLang]);

    const updateQuantity = async (itemId, newQuantity) => {
        if (isGuest || !itemId) return;
        if (newQuantity < 1) {
            
            return removeItem(itemId);
        }
        setActionLoading(true);
        try {
            await updateCartItems([{ itemId, quantity: newQuantity }]);
            setItems(prev => prev.map(i => (i.itemId || i.id) === itemId ? { ...i, quantity: newQuantity } : i));
            window.dispatchEvent(new Event('cartchange'));
        } catch (err) {
            console.error('Update quantity error:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const removeItem = async (itemId) => {
        if (!itemId) return;
        setActionLoading(true);
        try {
            await removeCartItem(itemId);
            setItems(prev => prev.filter(i => (i.itemId || i.id) !== itemId));
            window.dispatchEvent(new Event('cartchange'));
        } catch (err) {
            console.error('Remove item error:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (loading) return <Loader />;

    if (items.length === 0) {
        return (
          <div className="empty-cart-view transition-in">
            <div className="container">
              <div className="empty-wrap">
                <ShoppingBag size={80} strokeWidth={1} color="var(--text-muted)" />
                <h2>{t('cart.empty_title', 'Votre panier médical est vide')}</h2>
                <p>{t('cart.empty_desc', 'Prêt à moderniser votre infrastructure ? Découvrez nos dernières solutions.')}</p>
                <NavLink to="/catalogue" className="btn-primary mt-4">{t('cart.browse_catalogue', 'Parcourir le catalogue')}</NavLink>
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
              <NavLink to="/catalogue" className="back-link"><ArrowLeft size={16} /> {t('cart.continue_shopping', 'Continuer mes achats')}</NavLink>
            </div>

            {error && (
                <div className="cart-error-banner">
                    <AlertTriangle size={18} /> {error}
                    <button onClick={fetchCart}><RefreshCw size={14} /> {t('cart.retry', 'Retry')}</button>
                </div>
            )}

            {}
            {isGuest && (
                <div className="guest-banner">
                    <div className="guest-banner-icon"><ShieldCheck size={28} /></div>
                    <div className="guest-banner-text">
                        <strong>{t('cart.guest_saved', 'Votre panier est sauvegardé pour cette session')}</strong>
                        <p>{t('cart.guest_desc', 'Connectez-vous pour modifier les quantités, retirer des articles et passer la commande. Votre panier sera automatiquement fusionné.')}</p>
                    </div>
                    <NavLink to="/login" className="guest-login-btn">
                        <LogIn size={16} /> {t('cart.guest_sign_in', 'Se connecter')}
                    </NavLink>
                </div>
            )}

            <div className="cart-layout">
              <div className="cart-items-list card">
                <div className="list-labels">
                  <span>{t('cart.equipment', 'Équipement')}</span>
                  <span>{t('cart.quantity', 'Quantité')}</span>
                  <span>{t('cart.price', 'Prix')}</span>
                </div>
                {items.map(item => (
                  <div key={item.itemId || item.productId} className="cart-item">
                    <div className="item-main">
                      <div className="item-img">
                        {item.image
                          ? <img src={item.image} alt={item.name} />
                          : <ShoppingBag size={36} color="#cbd5e1" />
                        }
                      </div>
                      <div className="item-meta">
                        <h4>{item.name}</h4>
                        {item.category && <span className="item-cat">{item.category}</span>}
                        {!isGuest ? (
                            <button
                                className="remove-btn"
                                onClick={() => removeItem(item.itemId ?? item.id)}
                                disabled={actionLoading || !(item.itemId ?? item.id)}
                            >
                              <Trash2 size={16} /> {t('cart.remove', 'Retirer')}
                            </button>
                        ) : (
                            <NavLink to="/login" className="remove-btn-guest">
                                <LogIn size={14} /> {t('cart.sign_in_to_remove', 'Connectez-vous pour retirer')}
                            </NavLink>
                        )}
                      </div>
                    </div>

                    <div className="item-qty">
                      {!isGuest && item.itemId ? (
                          <div className="qty-control">
                            <button disabled={actionLoading} onClick={() => updateQuantity(item.itemId, item.quantity - 1)}><Minus size={14} /></button>
                            <span>{item.quantity}</span>
                            <button disabled={actionLoading} onClick={() => updateQuantity(item.itemId, item.quantity + 1)}><Plus size={14} /></button>
                          </div>
                      ) : (
                          <span className="qty-readonly">{item.quantity}</span>
                      )}
                    </div>

                    <div className="item-price">
                      <span className="unit-price">${(item.price * item.quantity).toLocaleString()}</span>
                      <small className="unit-ref">{t('cart.unit_price', { price: `$${Number(item.price).toLocaleString()}`, defaultValue: `$${Number(item.price).toLocaleString()} / unité` })}</small>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="cart-summary sticky-aside">
                <div className="summary-card card">
                  <h3>{t('cart.order_summary', 'Résumé de la commande')}</h3>
                  <div className="summary-row"><span>{t('cart.subtotal', 'Sous-total')}</span><span>${subtotal.toLocaleString()}</span></div>
                  <div className="summary-row"><span>{t('cart.global_shipping', 'Livraison globale')}</span><span className="free">{t('cart.free', 'GRATUITE')}</span></div>
                  <div className="divider" />
                  <div className="total-row">
                    <span>{t('cart.total_amount', 'Montant total')}</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>

                  {isGuest ? (
                      <NavLink to="/login" className="checkout-btn">
                          <LogIn size={18} /> {t('cart.sign_in_to_checkout', 'Se connecter pour commander')}
                      </NavLink>
                  ) : (
                      <button className="checkout-btn" onClick={() => navigate('/checkout')}>
                          <CreditCard size={18} /> {t('cart.proceed_to_order', 'Passer la commande')}
                      </button>
                  )}

                  <div className="security-badges">
                    <div className="sec-badge"><ShieldCheck size={16} /> {t('cart.secure_checkout', 'Paiement sécurisé')}</div>
                    <div className="sec-badge"><Truck size={16} /> {t('cart.priority_handling', 'Traitement médical prioritaire')}</div>
                  </div>
                </div>

                <div className="promo-box card">
                  <h4>{t('cart.quote_title', 'Devis institutionnel')}</h4>
                  <p>{t('cart.quote_desc', 'Besoin d\'un devis personnalisé pour un groupement d\'hôpitaux ?')}</p>
                  <NavLink to="/contact" className="quote-btn">{t('cart.quote_btn', 'Demander un devis B2B')}</NavLink>
                </div>
              </aside>
            </div>
          </div>

        </div>
    );
};

export default Cart;
