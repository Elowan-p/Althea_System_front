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
import { getProduct, getSimilarProducts, addItemToCart } from '../../services/api';
import Loader from '../../components/Loader/Loader';
import './Product.css';

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

        </div>
    );
};

export default Product;
