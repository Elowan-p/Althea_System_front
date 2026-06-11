import { useParams, NavLink } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  Share2,
  CheckCircle,
  Shield,
  Truck,
  ChevronRight,
  Plus,
  Minus,
  Star,
  FileText,
  Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getProduct, getSimilarProducts, addItemToCart } from '../services/api';
import Loader from '../components/common/Loader';

const Product = () => {
    const { t, i18n } = useTranslation();
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [similarEquipment, setSimilarEquipment] = useState([]);
    const [cartStatus, setCartStatus] = useState('idle');
    const [a11yMode, setA11yMode] = useState(() => localStorage.getItem('accessibilityMode') === 'true');

    useEffect(() => {
        const handleA11yChange = () => setA11yMode(localStorage.getItem('accessibilityMode') === 'true');
        window.addEventListener('accessibilitychange', handleA11yChange);
        return () => window.removeEventListener('accessibilitychange', handleA11yChange);
    }, []);

    const currentLang = i18n.language;

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const [productRes, similarRes] = await Promise.all([
                    getProduct(id),
                    getSimilarProducts(id)
                ]);
                setProduct(productRes.data);
                setSimilarEquipment(similarRes.data);
            } catch (err) {
                console.error("Error fetching product data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, currentLang]);

    const handleAddToCart = async () => {
        if (!product || product.inStock <= 0) return;
        setCartStatus('loading');
        try {
            await addItemToCart(product.id, quantity);
            window.dispatchEvent(new Event('cartchange'));
            setCartStatus('success');
            setTimeout(() => setCartStatus('idle'), 2500);
        } catch (err) {
            console.error('Add to cart error:', err);
            setCartStatus('error');
            setTimeout(() => setCartStatus('idle'), 2500);
        }
    };

    if (loading) return <Loader />;
    if (!product) return <div className="error-state container">{t('product_page.not_found', 'Product not found or system error.')}</div>;

    const cartLiveMessage =
        cartStatus === 'success' ? t('product_page.aria_cart_live_added', 'Produit ajouté au panier avec succès') :
        cartStatus === 'error'   ? t('product_page.aria_cart_live_error', 'Erreur lors de l\'ajout au panier') : '';

    return (
        <div className={`product-detail-page modern-bg${a11yMode ? ' a11y-mode' : ''}`}>
            <a href="#product-main-content" className="skip-to-content">
                {t('product_page.skip_to_content', 'Aller au contenu principal')}
            </a>
            {a11yMode && (
                <div className="a11y-banner" role="status">
                    {t('product_page.a11y_banner', 'Mode accessibilité activé — Textes agrandis et contrastes renforcés')}
                </div>
            )}
            <div aria-live="polite" aria-atomic="true" className="sr-only">{cartLiveMessage}</div>
            <div className="container" id="product-main-content">
                {/* Breadcrumbs */}
                <nav className="prod-breadcrumbs" aria-label={t('product_page.aria_breadcrumb', 'Fil d\'Ariane')}>
                    <NavLink to="/">{t('product_page.breadcrumb_catalogue', 'Catalogue')}</NavLink>
                    <ChevronRight size={14} />
                    <NavLink to={`/category/${product.category.id}`}>{product.category.title}</NavLink>
                    <ChevronRight size={14} />
                    <span className="current">{product.title}</span>
                </nav>

                <div className="product-grid">
                    {}
                    <div className="media-side">
                        <div className="main-stage card-glass">
                            <img src={product.pictureUrl || '/images/prod_scanner.png'} alt={product.title} />
                            {product.inStock <= 0 && <div className="oos-overlay">{t('product_page.limited_supply', 'Limited Supply')}</div>}
                        </div>
                        <div className="badges-row">
                            <div className="badge-item"><Shield size={18} /> {t('product_page.warranty', '2 Year Global Warranty')}</div>
                            <div className="badge-item"><Truck size={18} /> {t('product_page.secure_handling', 'Secure Handling')}</div>
                        </div>
                    </div>

                    {}
                    <div className="info-side">
                        <header className="info-header">
                            <span className="domain-pill">{product.medicalDomain}</span>
                            <h1 className="prod-title">{product.title}</h1>
                            <div className="rating-row">
                                <div className="stars">
                                    <Star size={16} fill="var(--accent)" color="var(--accent)" />
                                    <Star size={16} fill="var(--accent)" color="var(--accent)" />
                                    <Star size={16} fill="var(--accent)" color="var(--accent)" />
                                    <Star size={16} fill="var(--accent)" color="var(--accent)" />
                                    <Star size={16} fill="var(--accent)" color="var(--accent)" />
                                </div>
                                <span>(24 {t('product_page.reviews', 'Reviews')})</span>
                            </div>
                        </header>

                        <div className="price-box">
                            <div className="price-main">${Number(product.price).toLocaleString()}</div>
                            <div className="tax-tag">{t('product_page.excl_vat', 'Excl. VAT (Institutional Pricing)')}</div>
                        </div>

                        <div className="cta-block card">
                            <div className="qty-selector" role="group" aria-label={t('product_page.quantity_group', 'Quantité')}>
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    aria-label={t('product_page.aria_decrease_qty', 'Diminuer la quantité')}
                                >
                                    <Minus size={18} />
                                </button>
                                <span aria-live="polite" aria-label={t('product_page.aria_qty_value', 'Quantité sélectionnée : {{count}}', { count: quantity })}>
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    aria-label={t('product_page.aria_increase_qty', 'Augmenter la quantité')}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            <button
                                className={`btn-primary add-to-cart ${cartStatus}`}
                                disabled={product.inStock <= 0 || cartStatus === 'loading'}
                                onClick={handleAddToCart}
                                aria-label={
                                    cartStatus === 'success' ? t('product_page.added_cart', 'Added to Cart!') :
                                    product.inStock > 0 ? `${t('product_page.deploy_inventory', 'Add to Cart')} — ${product.title}` :
                                    t('product_page.request_availability', 'Request Availability')
                                }
                            >
                                {cartStatus === 'loading' && <Loader2 size={20} className="spin-icon" />}
                                {cartStatus === 'success' && <CheckCircle size={20} />}
                                {cartStatus === 'error' && <ShoppingCart size={20} />}
                                {cartStatus === 'idle' && <ShoppingCart size={20} />}
                                {cartStatus === 'loading' ? t('common.loading', 'Adding...') :
                                 cartStatus === 'success' ? t('product_page.added_cart', 'Added to Cart!') :
                                 cartStatus === 'error' ? t('product_page.error_retry', 'Error — Retry') :
                                 product.inStock > 0 ? t('product_page.deploy_inventory', 'Add to Cart') : t('product_page.request_availability', 'Request Availability')}
                            </button>
                            <button className="icon-btn-outline" aria-label={t('product_page.aria_wishlist', 'Ajouter aux favoris')}>
                                <Heart size={20} />
                            </button>
                            <button className="icon-btn-outline" aria-label={t('product_page.aria_share', 'Partager ce produit')}>
                                <Share2 size={20} />
                            </button>
                        </div>

                        <div className="trust-signals">
                            <div className={`signal ${product.inStock > 0 ? 'good' : 'bad'}`}>
                                <CheckCircle size={18} />
                                <span>{product.inStock > 0 ? t('product_page.ready_dispatch', { count: product.inStock, defaultValue: `Ready for Dispatch (${product.inStock} units)` }) : t('product_page.awaiting_restock', "Awaiting Restock")}</span>
                            </div>
                            <div className="signal good">
                                <FileText size={18} />
                                <span>{t('product_page.iso_infra', 'ISO 13485 Certified Infrastructure')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {}
                <div className="tabs-area card">
                    <div className="tabs-nav" role="tablist" aria-label={t('product_page.aria_tabs_label', 'Informations sur le produit')}>
                        <button
                            role="tab"
                            id="tab-btn-description"
                            aria-selected={activeTab === 'description'}
                            aria-controls="tabpanel-description"
                            className={activeTab === 'description' ? 'active' : ''}
                            onClick={() => setActiveTab('description')}
                        >
                            {t('product_page.tab_description', 'Description')}
                        </button>
                        <button
                            role="tab"
                            id="tab-btn-specs"
                            aria-selected={activeTab === 'specs'}
                            aria-controls="tabpanel-specs"
                            className={activeTab === 'specs' ? 'active' : ''}
                            onClick={() => setActiveTab('specs')}
                        >
                            {t('product_page.tab_specs', 'Technical Specifications')}
                        </button>
                        <button
                            role="tab"
                            id="tab-btn-support"
                            aria-selected={activeTab === 'support'}
                            aria-controls="tabpanel-support"
                            className={activeTab === 'support' ? 'active' : ''}
                            onClick={() => setActiveTab('support')}
                        >
                            {t('product_page.tab_support', 'Institutional Support')}
                        </button>
                    </div>
                    <div className="tab-content">
                        {activeTab === 'description' && (
                            <div
                                role="tabpanel"
                                id="tabpanel-description"
                                aria-labelledby="tab-btn-description"
                                className="rich-text"
                            >
                                <p>{product.description}</p>
                                <p>{t('product_page.standard_desc', 'Standardized for hospital environments requiring high precision and maximum uptime.')}</p>
                            </div>
                        )}
                        {activeTab === 'specs' && (
                            <div
                                role="tabpanel"
                                id="tabpanel-specs"
                                aria-labelledby="tab-btn-specs"
                                className="specs-list"
                            >
                                <div className="spec-row"><strong>{t('product_page.spec_standard', 'Standard')}</strong> <span>{t('product_page.spec_standard_val', 'Medical Grade CE/FDA')}</span></div>
                                <div className="spec-row"><strong>{t('product_page.spec_origin', 'Origin')}</strong> <span>{t('product_page.spec_origin_val', 'German Engineering')}</span></div>
                                <div className="spec-row"><strong>{t('product_page.spec_network', 'Network')}</strong> <span>{t('product_page.spec_network_val', 'HL7/DICOM Compliant')}</span></div>
                            </div>
                        )}
                        {activeTab === 'support' && (
                            <div
                                role="tabpanel"
                                id="tabpanel-support"
                                aria-labelledby="tab-btn-support"
                                className="rich-text"
                            >
                                <p>{t('product_page.support_desc', 'Our institutional support team is available 24/7 for maintenance and compliance assistance.')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {}
                <section className="related-section">
                    <h2 className="section-title">{t('product_page.similar_equipment', 'Similar Equipment')}</h2>
                    <div className="related-grid">
                        {similarEquipment.map(item => (
                            <NavLink to={`/product/${item.id}`} key={item.id} className="small-product-card card">
                                <img src={item.pictureUrl || '/images/prod_scanner.png'} alt={item.title} />
                                <h4>{item.title}</h4>
                                <p>${Number(item.price).toLocaleString()}</p>
                            </NavLink>
                        ))}
                    </div>
                </section>
            </div>

            <style>{`
                .skip-to-content {
                    position: absolute;
                    top: -200px;
                    left: 1rem;
                    background: var(--primary);
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 800;
                    font-size: 0.9rem;
                    z-index: 10000;
                    text-decoration: none;
                    transition: top 0.2s ease;
                }
                .skip-to-content:focus { top: 1rem; }

                .a11y-banner {
                    background: var(--primary);
                    color: white;
                    text-align: center;
                    padding: 0.6rem 1rem;
                    font-size: 0.85rem;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                }

                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }

                /* ── Accessibilité malvoyants ── */
                .a11y-mode .prod-title { font-size: 5.5rem !important; line-height: 1.15 !important; letter-spacing: 0 !important; }
                .a11y-mode .price-main { font-size: 5rem !important; }
                .a11y-mode .tax-tag { font-size: 1.2rem !important; font-weight: 700 !important; }
                .a11y-mode .rating-row { font-size: 1.15rem !important; gap: 1.5rem !important; }
                .a11y-mode .domain-pill { font-size: 1rem !important; padding: 0.6rem 1.4rem !important; }
                .a11y-mode .badge-item { font-size: 1.1rem !important; gap: 0.8rem !important; }
                .a11y-mode .signal { font-size: 1.1rem !important; gap: 1.2rem !important; }
                .a11y-mode .signal span { font-size: 1.15rem !important; }
                .a11y-mode .prod-breadcrumbs { font-size: 1rem !important; gap: 1rem !important; }
                .a11y-mode .rich-text p { font-size: 1.5rem !important; line-height: 2.3 !important; margin-bottom: 2rem !important; color: #1e293b !important; }
                .a11y-mode .spec-row { font-size: 1.25rem !important; padding: 1.5rem 0 !important; }
                .a11y-mode .spec-row strong { font-size: 1.25rem !important; }
                .a11y-mode .tabs-nav button { font-size: 1.15rem !important; padding: 2rem 3rem !important; }
                .a11y-mode .tab-content { padding: 3.5rem !important; }
                .a11y-mode .add-to-cart { font-size: 1.2rem !important; padding: 1.5rem !important; min-height: 60px !important; }
                .a11y-mode .qty-selector { font-size: 1.4rem !important; padding: 1rem 1.5rem !important; gap: 2rem !important; }
                .a11y-mode .qty-selector button { transform: scale(1.3) !important; }
                .a11y-mode .icon-btn-outline { width: 56px !important; height: 56px !important; }
                .a11y-mode .small-product-card h4 { font-size: 1.35rem !important; }
                .a11y-mode .small-product-card p { font-size: 1.2rem !important; }
                .a11y-mode .section-title { font-size: 2.2rem !important; }
                .a11y-mode .info-side { gap: 2.5rem !important; }
                .a11y-mode .price-box { border-left-width: 7px !important; padding-left: 2rem !important; }
                .a11y-mode *:focus-visible {
                    outline: 4px solid #005c97 !important;
                    outline-offset: 5px !important;
                    border-radius: 4px !important;
                }
                /* Overrides media queries */
                @media (max-width: 1024px) {
                    .a11y-mode .prod-title { font-size: 4rem !important; }
                    .a11y-mode .price-main { font-size: 3.8rem !important; }
                }
                @media (max-width: 640px) {
                    .a11y-mode .prod-title { font-size: 3rem !important; }
                    .a11y-mode .price-main { font-size: 3rem !important; }
                    .a11y-mode .rich-text p { font-size: 1.3rem !important; }
                    .a11y-mode .tabs-nav button { font-size: 1rem !important; padding: 1.2rem 1.5rem !important; }
                }

                .product-detail-page { padding-bottom: 8rem; }
                .prod-breadcrumbs { display: flex; align-items: center; gap: 0.8rem; padding: 3rem 0; font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
                .prod-breadcrumbs a:hover { color: var(--primary); }
                .prod-breadcrumbs .current { color: var(--text-main); }

                .product-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 5rem; align-items: start; margin-bottom: 5rem; }

                .media-side { display: flex; flex-direction: column; gap: 2rem; }
                .main-stage { 
                    height: 550px; 
                    background: white; 
                    border-radius: 32px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    padding: 4rem; 
                    position: relative;
                    overflow: hidden;
                }
                .main-stage img { max-width: 100%; max-height: 100%; object-fit: contain; }
                .oos-overlay { position: absolute; top: 2rem; right: 2rem; background: #1e293b; color: white; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 800; font-size: 0.75rem; }

                .badges-row { display: flex; gap: 2rem; justify-content: center; }
                .badge-item { display: flex; align-items: center; gap: 0.6rem; font-size: 0.8rem; font-weight: 700; color: #475569; }

                .info-side { display: flex; flex-direction: column; gap: 2rem; }
                .domain-pill { font-size: 0.75rem; font-weight: 900; color: var(--primary); background: rgba(0, 92, 151, 0.08); padding: 0.4rem 1rem; border-radius: 99px; width: fit-content; text-transform: uppercase; }
                .prod-title { font-size: 3.5rem; font-weight: 950; color: #012a4a; letter-spacing: -0.04rem; line-height: 1.1; }
                .rating-row { display: flex; align-items: center; gap: 1rem; color: #64748b; font-size: 0.9rem; font-weight: 600; }
                .stars { display: flex; gap: 2px; }

                .price-box { border-left: 5px solid var(--primary); padding-left: 1.5rem; }
                .price-main { font-size: 3rem; font-weight: 900; color: var(--primary); letter-spacing: -0.03rem; }
                .tax-tag { font-size: 0.85rem; color: #64748b; font-weight: 700; margin-top: 0.4rem; }

                .cta-block { display: flex; align-items: center; gap: 1.5rem; padding: 2rem !important; }
                .qty-selector { display: flex; align-items: center; gap: 1.5rem; background: #f1f5f9; padding: 0.6rem 1rem; border-radius: 12px; font-weight: 800; }
                .qty-selector button { color: #64748b; transition: var(--transition); }
                .qty-selector button:hover { color: var(--primary); }
                .add-to-cart { flex: 1; padding: 1.25rem !important; gap: 0.8rem; font-size: 1rem; transition: all 0.3s ease; }
                .add-to-cart.success { background: #059669 !important; }
                .add-to-cart.error { background: #dc2626 !important; }
                .add-to-cart.loading { opacity: 0.8; cursor: wait; }
                .spin-icon { animation: spin 0.8s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .trust-signals { display: flex; flex-direction: column; gap: 1.25rem; }
                .signal { display: flex; align-items: center; gap: 1rem; font-weight: 700; font-size: 0.9rem; }
                .signal.good { color: #059669; }
                .signal.bad { color: #dc2626; }

                .tabs-area { margin-top: 5rem; padding: 0 !important; overflow: hidden; }
                .tabs-nav { display: flex; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
                .tabs-nav button { padding: 1.5rem 2.5rem; font-weight: 800; font-size: 0.9rem; color: #64748b; border-bottom: 3px solid transparent; transition: var(--transition); }
                .tabs-nav button.active { color: var(--primary); border-bottom-color: var(--primary); background: white; }
                .tab-content { padding: 4rem; }
                .rich-text p { font-size: 1.1rem; line-height: 1.8; color: #4a4e69; margin-bottom: 1.5rem; }

                .spec-row { display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid #f1f5f9; font-size: 1rem; }
                .spec-row strong { color: #012a4a; }

                .related-section { margin-top: 8rem; }
                .related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 2rem; }
                .small-product-card { text-align: center; padding: 1.5rem !important; transition: var(--transition); }
                .small-product-card:hover { transform: translateY(-8px); }
                .small-product-card img { height: 160px; object-fit: contain; margin-bottom: 1rem; }
                .small-product-card h4 { font-size: 1.1rem; margin-bottom: 0.5rem; color: #012a4a; }
                .small-product-card p { font-weight: 800; color: var(--primary); }

                @media (max-width: 1024px) {
                    .product-grid { grid-template-columns: 1fr; gap: 3rem; }
                    .main-stage { height: 400px; }
                    .prod-title { font-size: 2.5rem; }
                }
                @media (max-width: 640px) {
                    .product-detail-page { padding-bottom: 4rem; }
                    .prod-breadcrumbs { padding: 1.5rem 0; flex-wrap: wrap; gap: 0.4rem; }
                    .product-grid { gap: 2rem; margin-bottom: 3rem; }
                    .main-stage { height: 280px; padding: 1.5rem; border-radius: 20px; }
                    .badges-row { flex-wrap: wrap; gap: 1rem; }
                    .prod-title { font-size: 1.8rem; }
                    .price-main { font-size: 2.2rem; }
                    .cta-block { flex-wrap: wrap; gap: 1rem; padding: 1.5rem !important; }
                    .add-to-cart { order: -1; flex: 1 1 100%; }
                    .qty-selector { flex: 1; justify-content: space-between; }
                    .tabs-area { margin-top: 3rem; }
                    .tabs-nav { overflow-x: auto; }
                    .tabs-nav button { padding: 1.1rem 1.25rem; white-space: nowrap; flex-shrink: 0; }
                    .tab-content { padding: 1.5rem; }
                    .rich-text p { font-size: 1rem; }
                    .spec-row { flex-direction: column; gap: 0.25rem; }
                    .related-section { margin-top: 4rem; }
                    .related-grid { grid-template-columns: 1fr 1fr; gap: 1rem; }
                    .small-product-card img { height: 110px; }
                }
            `}</style>
        </div>
    );
};

export default Product;
