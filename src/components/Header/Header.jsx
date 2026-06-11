import { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Menu, X, User, Search, Globe, ChevronDown, Activity, Eye, EyeOff } from 'lucide-react';
import { getCategories, getMyCart } from '../../services/api';
import { isAuthenticated as checkAuthenticated, isAdminUser } from '../../utils/auth';
import './Header.css';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const accountHubRef = useRef(null);
  const [searchValue, setSearchValue] = useState('');
  const [categories, setCategories] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(() => checkAuthenticated());
  const [isAdmin, setIsAdmin] = useState(() => isAdminUser());
  const [cartCount, setCartCount] = useState(0);
  const [a11yMode, setA11yMode] = useState(() => localStorage.getItem('accessibilityMode') === 'true');

  const toggleA11y = () => {
    const next = !a11yMode;
    setA11yMode(next);
    localStorage.setItem('accessibilityMode', String(next));
    window.dispatchEvent(new Event('accessibilitychange'));
  };

  const checkAdmin = useCallback(() => {
    setIsAdmin(isAdminUser());
  }, []);

  const fetchCartCount = useCallback(async () => {
    try {
      const res = await getMyCart();
      const data = res.data;
      if (!data) { setCartCount(0); return; }
      if (Array.isArray(data.items)) {
        setCartCount(data.items.reduce((acc, item) => acc + (item.quantity || 0), 0));
      } else if (data.items && typeof data.items === 'object') {
        setCartCount(Object.values(data.items).reduce((acc, qty) => acc + qty, 0));
      } else {
        setCartCount(0);
      }
    } catch { setCartCount(0); }
  }, []);

  const currentLang = i18n.language;

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) { console.error('Header Categories Error:', err); }
    };
    fetchCats();
  }, [currentLang]);

  useEffect(() => {
    const loadInitialCartCount = async () => { await fetchCartCount(); };
    loadInitialCartCount();

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    const syncAuth = () => {
      setIsAuthenticated(checkAuthenticated());
      checkAdmin();
      fetchCartCount();
    };
    const syncCart = () => fetchCartCount();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', syncAuth);
    window.addEventListener('authchange', syncAuth);
    window.addEventListener('cartchange', syncCart);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('authchange', syncAuth);
      window.removeEventListener('cartchange', syncCart);
    };
  }, [fetchCartCount, checkAdmin]);

  // Mobile sidebar: lock body scroll and allow closing with Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') setIsMenuOpen(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isMenuOpen]);

  // Profile dropdown: close when clicking outside (hover is unreliable on touch)
  useEffect(() => {
    if (!isProfileOpen) return;
    const handleClickOutside = (e) => {
      if (accountHubRef.current && !accountHubRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isProfileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) navigate(`/search?q=${searchValue}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminTwoFaVerified');
    window.dispatchEvent(new Event('authchange'));
    setCartCount(0);
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    window.dispatchEvent(new Event('logout-start'));
  };

  return (
    <header className={`ultra-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="top-utility desktop-only">
        <div className="container utils-flex">
           <div className="utility-left"><span>{t('header.subtitle', 'Althea Systems • Infrastructure médicale de précision')}</span></div>
           <div className="utility-right">
              <NavLink to="/contact">{t('header.technical_support', 'Support technique')}</NavLink>
              <div className="lang-select-wrapper">
                <Globe size={13} className="lang-select-icon" />
                <select
                  className="lang-select"
                  value={i18n.resolvedLanguage || i18n.language?.split('-')[0] || 'fr'}
                  onChange={(e) => {
                    const next = e.target.value;
                    i18n.changeLanguage(next);
                    window.dispatchEvent(new Event('languagechange'));
                  }}
                >
                  <option value="fr">FR</option>
                  <option value="en">EN</option>
                  <option value="ru">RU</option>
                </select>
              </div>
              <button
                className={`a11y-util-btn${a11yMode ? ' on' : ''}`}
                onClick={toggleA11y}
                aria-pressed={a11yMode}
                aria-label={a11yMode ? t('settings.accessibility_on', 'Accessibilité activée — cliquer pour désactiver') : t('settings.accessibility_off', 'Accessibilité désactivée — cliquer pour activer')}
                title={a11yMode ? t('settings.accessibility_title', 'Accessibilité malvoyants') + ' — ON' : t('settings.accessibility_title', 'Accessibilité malvoyants') + ' — OFF'}
              >
                {a11yMode ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
           </div>
        </div>
      </div>

      <div className="main-bar">
        <div className="container main-flex">
            <div className="flex-start">
                <button className="burger-btn mobile-only" onClick={() => setIsMenuOpen(true)}><Menu size={24} /></button>
                <NavLink to="/" className="brand-logo">
                    <img src="/images/logo.png" alt="Althea Systems" className="logo-img" />
                </NavLink>
            </div>

            <nav className="desktop-only center-nav">
                {isAdmin && (
                    <div className="nav-item">
                        <NavLink to="/admin">{t('header.dashboard', 'Dashboard')}</NavLink>
                        <div className="nav-accent"></div>
                    </div>
                )}
                <div className="nav-item has-dropdown">
                    <NavLink to="/catalogue" className="drop-trigger catalogue-trigger">{t('catalogue.breadcrumb_catalogue', 'Catalogue')} <ChevronDown size={14} /></NavLink>
                    <div className="nav-accent"></div>
                    <div className="mega-dropdown mega-dropdown--single">
                        <h6>{t('cart.browse_catalogue')}</h6>
                        <div className="mega-links">
                            <NavLink to="/catalogue"><Activity size={16} /> {t('catalogue.view_all_products', 'Tous les produits')}</NavLink>
                            {categories.map(cat => (
                                <NavLink key={cat.id} to={`/catalogue?category=${cat.id}`}>
                                    <Activity size={16} />{cat.title}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="nav-item">
                    <NavLink to="/contact">{t('footer.connect', 'Contact')}</NavLink>
                    <div className="nav-accent"></div>
                </div>
            </nav>

            <div className="flex-end">
                <form className="search-wrap desktop-only" onSubmit={handleSearch}>
                    <Search size={18} />
                    <input type="text" placeholder={t('header.search_placeholder', 'Rechercher un produit...')} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                </form>

                <div className="actions-cluster">
                    {!isAuthenticated ? (
                        <div className="auth-nav-links desktop-only">
                            <NavLink to="/login" className="nav-login-link">{t('header.sign_in', 'Connexion')}</NavLink>
                            <NavLink to="/register" className="btn-primary-sm">{t('header.register', "S'inscrire")}</NavLink>
                        </div>
                    ) : (
                        <div className="account-hub" ref={accountHubRef}>
                            <button className="icon-action-btn" onClick={() => setIsProfileOpen(prev => !prev)}><User size={24} /></button>
                            <div className={`profile-dropdown-container ${isProfileOpen ? 'open' : ''}`}>
                                <div className="mini-profile-card">
                                    <div className="profile-header">{t('header.workspace', 'Espace de travail')}</div>
                                    <NavLink to="/account/settings" onClick={() => setIsProfileOpen(false)}>{t('header.my_profile', 'Mon profil')}</NavLink>
                                    <NavLink to="/account/orders" onClick={() => setIsProfileOpen(false)}>{t('header.quick_orders', 'Commandes rapides')}</NavLink>
                                    {isAdmin && (
                                        <NavLink to="/admin" onClick={() => setIsProfileOpen(false)}>{t('header.admin_dashboard', 'Backoffice')}</NavLink>
                                    )}
                                    <button className="btn-logout" onClick={handleLogout}>{t('header.sign_out', 'Déconnexion')}</button>
                                </div>
                            </div>
                        </div>
                    )}
                    <NavLink to="/cart" className="cart-btn-wrap">
                        <div className="cart-icon-box">
                            <ShoppingCart size={22} />
                            {cartCount > 0 && <span className="badge">{cartCount > 99 ? '99+' : cartCount}</span>}
                        </div>
                    </NavLink>
                </div>
            </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sidebar-mask" onClick={() => setIsMenuOpen(false)}>
            <div className="sidebar-panel" onClick={e => e.stopPropagation()}>
                <header className="side-header">
                    <div className="brand-logo">
                        <img src="/images/logo.png" alt="Althea Systems" className="logo-img" />
                    </div>
                    <button className="close-side" onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
                </header>
                <div className="side-content">
                    <form className="side-search" onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }}>
                        <Search size={18} />
                        <input type="text" placeholder={t('header.search_placeholder', 'Rechercher un produit...')} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                    </form>
                    <div className="side-section">
                        <label>Navigation principale</label>
                        <NavLink to="/" onClick={() => setIsMenuOpen(false)}>Accueil</NavLink>
                        {isAdmin && (
                            <NavLink to="/admin" onClick={() => setIsMenuOpen(false)}>{t('header.dashboard', 'Dashboard')}</NavLink>
                        )}
                        <NavLink to="/catalogue" onClick={() => setIsMenuOpen(false)}>Catalogue de produits</NavLink>
                        <NavLink to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</NavLink>
                    </div>
                    <div className="side-section">
                        <label>{t('home.categories', 'Catégories')}</label>
                        {categories.map((cat) => (
                            <NavLink key={cat.id} to={`/catalogue?category=${cat.id}`} onClick={() => setIsMenuOpen(false)}>{cat.title}</NavLink>
                        ))}
                    </div>
                    <div className="side-section">
                        <label>{t('header.workspace', 'Espace de travail')}</label>
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/account/settings" onClick={() => setIsMenuOpen(false)}>{t('header.my_profile', 'Mon profil')}</NavLink>
                                <NavLink to="/account/orders" onClick={() => setIsMenuOpen(false)}>{t('header.quick_orders', 'Commandes rapides')}</NavLink>
                                <button className="side-logout" onClick={handleLogout}>{t('header.sign_out', 'Déconnexion')}</button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>{t('header.sign_in', 'Connexion')}</NavLink>
                                <NavLink to="/register" onClick={() => setIsMenuOpen(false)}>{t('header.register', "S'inscrire")}</NavLink>
                            </>
                        )}
                    </div>
                    <div className="side-lang">
                        <Globe size={16} />
                        <select
                            className="lang-select"
                            value={i18n.resolvedLanguage || i18n.language?.split('-')[0] || 'fr'}
                            onChange={(e) => {
                                const next = e.target.value;
                                i18n.changeLanguage(next);
                                window.dispatchEvent(new Event('languagechange'));
                            }}
                        >
                            <option value="fr">FR</option>
                            <option value="en">EN</option>
                            <option value="ru">RU</option>
                        </select>
                        <button
                            className={`a11y-side-btn${a11yMode ? ' on' : ''}`}
                            onClick={toggleA11y}
                            aria-pressed={a11yMode}
                            aria-label={a11yMode ? t('settings.accessibility_on', 'Accessibilité activée — cliquer pour désactiver') : t('settings.accessibility_off', 'Accessibilité désactivée — cliquer pour activer')}
                        >
                            {a11yMode ? <EyeOff size={16} /> : <Eye size={16} />}
                            <span>{a11yMode ? t('settings.accessibility_label_on', 'Activé') : t('settings.accessibility_label_off', 'Désactivé')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </header>
  );
};

export default Header;
