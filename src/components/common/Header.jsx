import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  User, 
  Search, 
  Globe, 
  ChevronDown,
  Stethoscope,
  Activity,
  Zap,
  Building,
  Wrench,
  Award
} from 'lucide-react';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const cartCount = 3; 
  const isAuthenticated = !!localStorage.getItem('token');

  const toggleLanguage = () => {
    const languages = ['en', 'de', 'fr'];
    const currentIndex = languages.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % languages.length;
    i18n.changeLanguage(languages[nextIndex]);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${searchValue}`);
    }
  };

  return (
    <header className={`ultra-header ${isScrolled ? 'scrolled' : ''}`}>
      {/* Top Utility Bar */}
      <div className="top-utility desktop-only">
        <div className="container utils-flex">
           <div className="utility-left">
              <span>Premium Medical Infrastructure Solutions</span>
           </div>
           <div className="utility-right">
              <NavLink to="/contact">Support</NavLink>
              <NavLink to="/contact">FAQ</NavLink>
              <button className="lang-trigger" onClick={toggleLanguage}>
                <Globe size={13} /> {i18n.language.toUpperCase()}
              </button>
           </div>
        </div>
      </div>

      <div className="main-bar">
        <div className="container main-flex">
            {/* Left: Brand */}
            <div className="flex-start">
                <button className="burger-btn mobile-only" onClick={() => setIsMenuOpen(true)}>
                    <Menu size={24} />
                </button>
                <NavLink to="/" className="brand-logo">
                    <div className="logo-symbol">A</div>
                    <div className="logo-text">
                        <span className="main">ALTHEA</span>
                        <span className="sub">SYSTEMS</span>
                    </div>
                </NavLink>
            </div>

            {/* Center: Main Nav */}
            <nav className="desktop-only center-nav">
                <div className="nav-item">
                    <NavLink to="/">{t('home.welcome')}</NavLink>
                    <div className="nav-accent"></div>
                </div>
                
                <div className="nav-item has-dropdown">
                    <span className="drop-trigger">Shop <ChevronDown size={14} /></span>
                    <div className="nav-accent"></div>
                    
                    <div className="mega-dropdown">
                        <div className="mega-grid">
                            <div className="mega-col">
                                <h6>Divisions</h6>
                                <div className="mega-links">
                                    <NavLink to="/category/4"><Stethoscope size={16} /> Surgical Systems</NavLink>
                                    <NavLink to="/category/5"><Activity size={16} /> Diagnostic Imaging</NavLink>
                                    <NavLink to="/category/6"><Zap size={16} /> Lab Automation</NavLink>
                                    <NavLink to="/category/7"><Building size={16} /> Ward Furniture</NavLink>
                                </div>
                            </div>
                            <div className="mega-col highlight-col">
                                <h6>Clinics</h6>
                                <div className="mega-links">
                                    <NavLink to="/search?q=cardiology">Cardiovascular</NavLink>
                                    <NavLink to="/search?q=neurology">Neuroscience</NavLink>
                                    <NavLink to="/search?q=oncology">Oncology</NavLink>
                                    <NavLink to="/search?q=emergency">Acute Care</NavLink>
                                </div>
                            </div>
                            <div className="mega-col">
                                <h6>Excellence</h6>
                                <div className="mega-links">
                                    <NavLink to="/contact"><Wrench size={16} /> Tech Services</NavLink>
                                    <NavLink to="/contact"><Award size={16} /> Quality Assurance</NavLink>
                                    <NavLink to="/contact"><Building size={16} /> Global Logistics</NavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="nav-item">
                    <NavLink to="/contact">Contact</NavLink>
                    <div className="nav-accent"></div>
                </div>
            </nav>

            {/* Right: Actions */}
            <div className="flex-end">
                <form className="search-wrap desktop-only" onSubmit={handleSearch}>
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search assets..." 
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </form>

                <div className="actions-cluster">
                    <div className="account-hub">
                        <button className="icon-action-btn"><User size={24} /></button>
                        <div className="profile-dropdown-container">
                            <div className="mini-profile-card">
                                {isAuthenticated ? (
                                    <>
                                        <div className="profile-header">Workspace</div>
                                        <NavLink to="/account/settings">My Profile</NavLink>
                                        <NavLink to="/account/orders">Quick Orders</NavLink>
                                        <button className="btn-logout" onClick={() => { localStorage.removeItem('token'); window.location.reload(); }}>Sign Out</button>
                                    </>
                                ) : (
                                    <>
                                        <div className="profile-header">Institutional Login</div>
                                        <NavLink to="/login" className="btn-primary-sm">Sign In</NavLink>
                                        <NavLink to="/register" className="text-link-sm">Request Access</NavLink>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <NavLink to="/cart" className="cart-btn-wrap">
                        <div className="cart-icon-box">
                            <ShoppingCart size={22} />
                            {cartCount > 0 && <span className="badge">{cartCount}</span>}
                        </div>
                    </NavLink>
                </div>
            </div>
        </div>
      </div>

      {/* Sidebar Overlay (Mobile Only) */}
      {isMenuOpen && (
        <div className="sidebar-mask" onClick={() => setIsMenuOpen(false)}>
            <div className="sidebar-panel" onClick={e => e.stopPropagation()}>
                <header className="side-header">
                    <div className="brand-logo">
                        <div className="logo-symbol">A</div>
                        <div className="brand-text-sm">ALTHEA</div>
                    </div>
                    <button className="close-side" onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
                </header>
                <div className="side-content">
                    <div className="side-section">
                        <label>Main Navigation</label>
                        <NavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
                        <NavLink to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</NavLink>
                    </div>
                    <div className="side-section">
                        <label>Shop by Division</label>
                        <NavLink to="/category/4" onClick={() => setIsMenuOpen(false)}>Surgical</NavLink>
                        <NavLink to="/category/5" onClick={() => setIsMenuOpen(false)}>Diagnostics</NavLink>
                        <NavLink to="/category/6" onClick={() => setIsMenuOpen(false)}>Lab Tools</NavLink>
                        <NavLink to="/category/7" onClick={() => setIsMenuOpen(false)}>Furniture</NavLink>
                    </div>
                </div>
            </div>
        </div>
      )}

      <style>{`
        .ultra-header {
           background: white;
           position: sticky;
           top: 0;
           z-index: 2000;
           transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .ultra-header.scrolled {
           box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1);
        }

        .top-utility {
           background: #f8fafc;
           border-bottom: 1px solid #f1f5f9;
           padding: 0.6rem 0;
           font-size: 0.7rem;
           font-weight: 700;
           text-transform: uppercase;
           letter-spacing: 0.05em;
           color: #64748b;
        }
        .utils-flex { display: flex; justify-content: space-between; align-items: center; }
        .utility-right { display: flex; gap: 1.5rem; align-items: center; }
        .lang-trigger { display: flex; align-items: center; gap: 4px; color: var(--text-main); font-weight: 800; cursor: pointer; }

        .main-bar { padding: 1.25rem 0; transition: inherit; }
        .ultra-header.scrolled .main-bar { padding: 0.8rem 0; }
        .main-flex { display: flex; justify-content: space-between; align-items: center; gap: 3rem; }

        .flex-start { display: flex; align-items: center; gap: 1.5rem; }
        .burger-btn { color: var(--text-main); }

        .brand-logo { display: flex; align-items: center; gap: 0.8rem; text-decoration: none; }
        .logo-symbol { background: var(--primary); color: white; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; font-weight: 900; font-size: 1.5rem; }
        .logo-text { display: flex; flex-direction: column; line-height: 1; }
        .logo-text .main { font-weight: 900; font-size: 1.4rem; color: #012a4a; letter-spacing: -0.05em; }
        .logo-text .sub { font-weight: 400; font-size: 0.8rem; color: #64748b; letter-spacing: 0.2em; }

        .center-nav { display: flex; align-items: center; gap: 1.5rem; flex: 1; justify-content: center; }
        .nav-item { position: relative; padding: 0.5rem 0; }
        .nav-item a, .drop-trigger { font-weight: 700; font-size: 0.95rem; color: #4a4e69; text-decoration: none; transition: var(--transition); cursor: pointer; display: flex; align-items: center; gap: 4px; }
        .nav-item:hover a, .nav-item:hover .drop-trigger { color: var(--primary); }
        .nav-accent { position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: var(--primary); transition: width 0.3s ease; }
        .nav-item:hover .nav-accent { width: 100%; }

        /* Mega Dropdown */
        .mega-dropdown {
           position: absolute;
           top: 100%;
           left: 50%;
           transform: translateX(-50%) translateY(20px);
           background: white;
           padding: 2.5rem;
           border-radius: 20px;
           box-shadow: 0 40px 80px -20px rgba(0,0,0,0.15);
           border: 1px solid #f1f5f9;
           width: 700px;
           visibility: hidden;
           opacity: 0;
           transition: all 0.3s ease;
        }
        .nav-item:hover .mega-dropdown { visibility: visible; opacity: 1; transform: translateX(-50%) translateY(0); }
        .mega-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; }
        .mega-col h6 { font-size: 0.7rem; font-weight: 950; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.1em; margin-bottom: 1.5rem; }
        .mega-links a { display: flex; align-items: center; gap: 10px; padding: 0.6rem 0.8rem; border-radius: 10px; font-size: 0.9rem; font-weight: 700; color: #334155; }
        .mega-links a:hover { background: #f8fafc; color: var(--primary); }
        .highlight-col { background: #f8fafc; padding: 1.25rem; border-radius: 16px; }

        /* Right */
        .flex-end { display: flex; align-items: center; gap: 2rem; justify-content: flex-end; }
        .search-wrap { display: flex; align-items: center; gap: 0.8rem; background: #f1f5f9; padding: 0.6rem 1.2rem; border-radius: 12px; width: 180px; transition: all 0.3s ease; }
        .search-wrap:focus-within { width: 280px; background: white; box-shadow: 0 0 0 2px var(--primary); }
        .search-wrap input { border: none; background: transparent; outline: none; font-size: 0.85rem; font-weight: 600; width: 100%; }

        .actions-cluster { display: flex; align-items: center; gap: 1.5rem; }
        .icon-action-btn { color: #475569; transition: var(--transition); }
        .icon-action-btn:hover { color: var(--primary); }

        .cart-icon-box { position: relative; width: 44px; height: 44px; background: #f1f5f9; color: var(--primary); display: flex; align-items: center; justify-content: center; border-radius: 12px; }
        .badge { position: absolute; top: -6px; right: -6px; background: #ef4444; color: white; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900; border-radius: 50%; border: 2.5px solid white; }

        /* FIX: Account Hover Gap */
        .account-hub { position: relative; display: flex; align-items: center; height: 100%; }
        .profile-dropdown-container {
            position: absolute;
            top: 100%;
            right: 0;
            padding-top: 1rem; /* The bridge */
            visibility: hidden;
            opacity: 0;
            transition: all 0.2s ease;
            z-index: 10;
        }
        .account-hub:hover .profile-dropdown-container { visibility: visible; opacity: 1; transform: translateY(0); }
        .mini-profile-card {
            width: 240px;
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 20px 50px rgba(0,0,0,0.15);
            border: 1px solid #f1f5f9;
        }
        .profile-header { font-size: 0.7rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 1rem; letter-spacing: 0.05em; }
        .mini-profile-card a { display: block; padding: 0.6rem 0; font-size: 0.95rem; font-weight: 700; color: #334155; }
        .mini-profile-card a:hover { color: var(--primary); }
        .btn-logout { margin-top: 1rem; color: #ef4444; font-weight: 700; font-size: 0.9rem; }
        
        .btn-primary-sm { background: var(--primary); color: white !important; text-align: center; padding: 0.75rem !important; border-radius: 10px; margin-bottom: 0.5rem; }
        .text-link-sm { text-align: center; font-size: 0.8rem !important; }

        /* Sidebar Mask */
        .sidebar-mask { position: fixed; inset: 0; background: rgba(1, 42, 74, 0.4); backdrop-filter: blur(4px); z-index: 5000; }
        .sidebar-panel { width: 340px; height: 100%; background: white; animation: slideR 0.4s ease; }
        .side-header { padding: 2rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .side-content { padding: 2rem; }
        .side-section label { font-size: 0.7rem; font-weight: 900; color: #cbd5e1; display: block; margin-bottom: 1rem; }
        .side-section a { display: block; font-size: 1.15rem; font-weight: 800; color: #012a4a; padding: 0.8rem 0; border-bottom: 1px solid #f1f5f9; }
        
        @keyframes slideR { from { transform: translateX(-100%); } to { transform: translateX(0); } }

        .mobile-only { display: block; }
        .desktop-only { display: none; }
        @media (min-width: 1024px) {
            .mobile-only { display: none; }
            .desktop-only { display: flex; }
        }
      `}</style>
    </header>
  );
};

export default Header;
