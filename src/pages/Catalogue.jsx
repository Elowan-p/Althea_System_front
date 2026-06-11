import { useState, useEffect, useCallback } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { Grid, List as ListIcon, Star, SlidersHorizontal, ChevronRight, X, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProducts, getCategories } from '../services/api';
import Loader from '../components/common/Loader';

const Catalogue = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadTime, setLoadTime] = useState(null);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('default');

  const activeCategoryId = searchParams.get('category')
    ? Number(searchParams.get('category'))
    : null;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();
    try {
      const [prodRes, catRes] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
      setLoadTime(elapsed);
    } catch (err) {
      console.error('Catalogue fetch error:', err);
      setError(t('catalogue.error_load', 'Impossible de charger les données. Vérifiez la connexion au serveur.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCategoryFilter = (catId) => {
    if (catId === activeCategoryId) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const clearFilter = () => {
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  const filteredProducts = activeCategoryId
    ? products.filter((p) => p.category?.id === activeCategoryId)
    : products;

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    return 0;
  });

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  if (loading) return <Loader />;

  return (
    <div className="catalogue-page">
      {}
      <section className="cat-hero-banner">
        <div className="container">
          <nav className="cat-breadcrumb">
            <NavLink to="/">{t('catalogue.breadcrumb_home', 'Accueil')}</NavLink>
            <ChevronRight size={12} />
            <span className="active">{t('catalogue.breadcrumb_catalogue', 'Catalogue de produits')}</span>
            {activeCategory && (
              <>
                <ChevronRight size={12} />
                <span className="active">{activeCategory.title}</span>
              </>
            )}
          </nav>
          <h1 className="cat-hero-title">
            {activeCategory ? activeCategory.title : t('catalogue.breadcrumb_catalogue', 'Catalogue de produits')}
          </h1>
          <p className="cat-hero-sub">
            {activeCategory
              ? (i18n.language.startsWith('ru')
                  ? `Специализированные решения для ${activeCategory.title.toLowerCase()}.`
                  : i18n.language.startsWith('en')
                    ? `Specialized solutions for ${activeCategory.title.toLowerCase()}.`
                    : `Solutions spécialisées pour ${activeCategory.title.toLowerCase()}.`)
              : t('catalogue.hero_subtitle', 'Découvrez l\'ensemble de notre gamme d\'équipements médicaux de haute précision.')}
          </p>
          {loadTime && (
            <div className="load-time-badge">
              <Clock size={12} />
              <span>{t('catalogue.load_time', { defaultValue: 'Données chargées en {{time}}s', time: loadTime })}</span>
            </div>
          )}
        </div>
      </section>

      <div className="container catalogue-layout">
        {}
        <aside className="cat-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-header">
              <SlidersHorizontal size={16} />
              <h3>{t('catalogue.filter_by_category', 'Filtrer par catégorie')}</h3>
            </div>
            <ul className="cat-filter-list">
              <li>
                <button
                  className={`cat-filter-btn ${!activeCategoryId ? 'active' : ''}`}
                  onClick={clearFilter}
                >
                  <span>{t('catalogue.all_categories', 'Toutes les catégories')}</span>
                  <span className="count-badge">{products.length}</span>
                </button>
              </li>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category?.id === cat.id).length;
                return (
                  <li key={cat.id}>
                    <button
                      className={`cat-filter-btn ${activeCategoryId === cat.id ? 'active' : ''}`}
                      onClick={() => handleCategoryFilter(cat.id)}
                    >
                      <span>{cat.title}</span>
                      <span className="count-badge">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {}
        <main className="cat-main-content">
          {error && (
            <div className="error-banner">
              <p>{error}</p>
              <button onClick={fetchData} className="retry-btn">{t('cart.retry', 'Réessayer')}</button>
            </div>
          )}

          {}
          <div className="cat-toolbar-bar">
            <div className="toolbar-left">
              {activeCategoryId && (
                <span className="active-filter-chip">
                  {activeCategory?.title}
                  <button onClick={clearFilter}><X size={12} /></button>
                </span>
              )}
              <span className="results-info">
                <strong>{sortedProducts.length}</strong> {sortedProducts.length === 1 ? t('catalogue.products_count_one', 'produit trouvé') : t('catalogue.products_count_other', 'produits trouvés')}
              </span>
            </div>
            <div className="toolbar-right">
              <div className="sort-group">
                <label>{t('catalogue.sort_by', 'Trier :')}</label>
                <select
                  className="minimal-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="default">{t('catalogue.sort_default', 'Par défaut')}</option>
                  <option value="price-asc">{t('catalogue.sort_price_asc', 'Prix croissant')}</option>
                  <option value="price-desc">{t('catalogue.sort_price_desc', 'Prix décroissant')}</option>
                  <option value="name">{t('catalogue.sort_name', 'Nom A-Z')}</option>
                </select>
              </div>
              <div className="view-toggle">
                <button
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  title="Vue grille"
                >
                  <Grid size={16} />
                </button>
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                  title="Vue liste"
                >
                  <ListIcon size={16} />
                </button>
              </div>
            </div>
          </div>

          {}
          {sortedProducts.length > 0 ? (
            <div className={`product-flow ${viewMode}`}>
              {sortedProducts.map((prod) => (
                <NavLink
                  to={`/product/${prod.id}`}
                  key={prod.id}
                  className="premium-card"
                >
                  <div className="card-media">
                    <img
                      src={prod.pictureUrl || '/images/prod_scanner.png'}
                      alt={prod.title}
                    />
                    {prod.inStock <= 0 && (
                      <span className="tag-oos">{t('catalogue.limited_supply', 'Stock limité')}</span>
                    )}
                    <div className="card-overlay">
                      <button className="view-detail-btn">{t('catalogue.view_details', 'Voir les détails')}</button>
                    </div>
                  </div>
                  <div className="card-info">
                    <div className="info-top">
                      <span className="cat-tag">
                        {prod.category?.title || prod.medicalDomain || 'Médical'}
                      </span>
                      <div className="rating">
                        <Star size={12} fill="var(--accent)" color="var(--accent)" />
                        <span>4.9</span>
                      </div>
                    </div>
                    <h3 className="item-title">{prod.title}</h3>
                    <div className="info-bottom">
                      <span className="item-price">
                        {Number(prod.price).toLocaleString(i18n.language, {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </span>
                      <div className="stock-status">
                        <div className={`dot ${prod.inStock > 0 ? 'online' : 'offline'}`} />
                        <span>{prod.inStock > 0 ? t('catalogue.in_stock', 'En stock') : t('catalogue.out_of_stock', 'Rupture')}</span>
                      </div>
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          ) : (
            <div className="empty-state-full">
              <p>{t('catalogue.no_products', 'Aucun produit disponible dans cette catégorie.')}</p>
              <button onClick={clearFilter} className="btn-primary-sm-blue">
                {t('catalogue.view_all_products', 'Voir tous les produits')}
              </button>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .catalogue-page { background: hsl(210, 40%, 98%); min-height: 100vh; }
 
        /* Hero Banner */
        .cat-hero-banner {
          padding: 4.5rem 0 3.5rem;
          background: linear-gradient(135deg, hsl(222, 47%, 18%) 0%, hsl(212, 100%, 35%) 100%);
          color: white;
          margin-bottom: 3rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }
        .cat-breadcrumb {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.05em; color: rgba(255,255,255,0.65); margin-bottom: 1.5rem;
        }
        .cat-breadcrumb a { color: rgba(255,255,255,0.65); transition: var(--transition-fast); }
        .cat-breadcrumb a:hover { color: white; }
        .cat-breadcrumb .active { color: white; }
        .cat-hero-title {
          font-size: 3.25rem; font-weight: 950; letter-spacing: -0.04em;
          margin-bottom: 0.75rem; line-height: 1.1;
        }
        .cat-hero-sub { font-size: 1.15rem; opacity: 0.85; max-width: 600px; line-height: 1.6; }
        .load-time-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          margin-top: 1.25rem; background: rgba(255,255,255,0.1);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.15); padding: 0.4rem 0.9rem;
          border-radius: 99px; font-size: 0.72rem; font-weight: 700; color: rgba(255,255,255,0.9);
        }
 
        /* Layout */
        .catalogue-layout { display: grid; grid-template-columns: 290px 1fr; gap: 2.5rem; padding-bottom: 6rem; }
 
        /* Sidebar */
        .sidebar-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-radius: 24px;
          border: 1px solid rgba(226, 232, 240, 0.7); padding: 2rem;
          position: sticky; top: 100px; align-self: start;
          box-shadow: var(--shadow);
        }
        .sidebar-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.5rem; }
        .sidebar-header h3 { font-size: 0.85rem; font-weight: 900; color: var(--secondary); text-transform: uppercase; letter-spacing: 0.05em; }
        .cat-filter-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.4rem; }
        .cat-filter-btn {
          width: 100%; display: flex; justify-content: space-between; align-items: center;
          padding: 0.7rem 1.1rem; border-radius: 12px; font-size: 0.9rem;
          font-weight: 700; color: var(--text-main); transition: var(--transition-fast); text-align: left;
          border: 1px solid transparent;
        }
        .cat-filter-btn:hover { background: rgba(0, 92, 151, 0.05); color: var(--primary); }
        .cat-filter-btn.active { 
          background: var(--primary-gradient); 
          color: white; 
          box-shadow: 0 4px 12px rgba(0, 92, 151, 0.2);
        }
        .cat-filter-btn.active .count-badge { background: rgba(255,255,255,0.2); color: white; }
        .count-badge {
          background: rgba(241, 245, 249, 0.9); color: var(--text-muted); font-size: 0.7rem;
          font-weight: 900; padding: 0.15rem 0.55rem; border-radius: 99px;
          transition: var(--transition-fast);
        }
 
        /* Toolbar */
        .cat-toolbar-bar {
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(226, 232, 240, 0.7); border-radius: 20px;
          padding: 1rem 1.5rem; margin-bottom: 2.5rem;
          box-shadow: var(--shadow);
        }
        .toolbar-left { display: flex; align-items: center; gap: 1rem; }
        .toolbar-right { display: flex; align-items: center; gap: 1.5rem; }
        .results-info { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
        .results-info strong { color: var(--secondary); font-weight: 900; }
        
        .active-filter-chip {
          display: flex; align-items: center; gap: 0.4rem;
          background: rgba(0, 92, 151, 0.08); color: var(--primary); padding: 0.35rem 0.85rem;
          border-radius: 99px; font-size: 0.8rem; font-weight: 800;
          transition: var(--transition-fast);
          border: 1px solid rgba(0, 92, 151, 0.15);
        }
        .active-filter-chip:hover {
          background: rgba(0, 92, 151, 0.15);
        }
        .active-filter-chip button { display: flex; align-items: center; color: var(--primary); transition: var(--transition-fast); }
        .active-filter-chip button:hover { transform: scale(1.15) rotate(90deg); }
        
        .sort-group { display: flex; align-items: center; gap: 0.6rem; }
        .sort-group label { font-size: 0.78rem; font-weight: 850; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.02em; }
        
        .minimal-select { 
          border: 1.5px solid rgba(226, 232, 240, 0.8); 
          background: white; 
          padding: 0.4rem 0.8rem;
          border-radius: 10px;
          font-weight: 700; color: var(--text-main); font-family: inherit; cursor: pointer; font-size: 0.9rem;
          transition: var(--transition-fast);
        }
        .minimal-select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--focus-ring);
        }
        
        .view-toggle { display: flex; background: rgba(241, 245, 249, 0.8); padding: 4px; border-radius: 10px; gap: 2px; }
        .view-toggle button { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: var(--transition-fast); border-radius: 8px; }
        .view-toggle button.active { background: white; color: var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .view-toggle button:hover:not(.active) { color: var(--primary); transform: scale(1.05); }
 
        /* Products Grid / Flow */
        .product-flow.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 2rem; }
        .product-flow.list { display: flex; flex-direction: column; gap: 1.5rem; }
        .product-flow.list .premium-card { flex-direction: row; height: 200px; }
        .product-flow.list .card-media { width: 220px; height: 100%; flex-shrink: 0; }
        .product-flow.list .item-title { height: auto; }
 
        .premium-card {
          display: flex; flex-direction: column; text-decoration: none;
          background: white; border-radius: 20px;
          transition: var(--transition);
          border: 1px solid var(--border); overflow: hidden;
        }
        .premium-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-premium); border-color: hsl(214, 32%, 80%); }
        
        .card-media {
          height: 240px; background: hsl(210, 40%, 97%); padding: 2rem;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden; transition: var(--transition);
        }
        .card-media img { max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .premium-card:hover .card-media img { transform: scale(1.06); }
        .tag-oos { position: absolute; top: 1rem; left: 1rem; background: var(--secondary); color: white; font-size: 0.62rem; font-weight: 900; text-transform: uppercase; padding: 0.35rem 0.75rem; border-radius: 6px; }
        
        .card-overlay { position: absolute; inset: 0; background: rgba(0, 92, 151, 0.05); opacity: 0; transition: var(--transition); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 1.5rem; }
        .premium-card:hover .card-overlay { opacity: 1; }
        .view-detail-btn { background: white; color: var(--primary); padding: 0.65rem 1.5rem; border-radius: 12px; font-weight: 700; font-size: 0.85rem; box-shadow: 0 8px 16px rgba(0,0,0,0.08); transition: var(--transition-fast); transform: translateY(10px); }
        .premium-card:hover .view-detail-btn { transform: translateY(0); }
        .view-detail-btn:hover { background: var(--primary); color: white; }
 
        .card-info { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
        .info-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .cat-tag { font-size: 0.68rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; }
        .rating { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; font-weight: 800; color: var(--accent); }
        .item-title { font-size: 1.15rem; font-weight: 850; color: var(--secondary); margin-bottom: 1rem; line-height: 1.3; height: 2.9rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .info-bottom { display: flex; align-items: flex-end; justify-content: space-between; margin-top: auto; }
        .item-price { font-size: 1.55rem; font-weight: 900; color: var(--primary); letter-spacing: -0.02em; }
        .stock-status { display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; font-weight: 700; color: var(--text-muted); }
        .dot { width: 7px; height: 7px; border-radius: 50%; }
        .dot.online { background: var(--success); box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
        .dot.offline { background: var(--error); }
 
        /* Empty / Error */
        .empty-state-full { text-align: center; padding: 6rem 2rem; color: var(--text-muted); }
        .empty-state-full p { font-size: 1.1rem; margin-bottom: 1.5rem; }
        .btn-primary-sm-blue { background: var(--primary-gradient); color: white; padding: 0.75rem 1.8rem; border-radius: 12px; font-weight: 800; font-size: 0.9rem; box-shadow: 0 4px 12px rgba(0, 92, 151, 0.2); transition: var(--transition-fast); }
        .btn-primary-sm-blue:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 92, 151, 0.3); }
        .error-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; color: #b91c1c; font-weight: 700; }
        .retry-btn { background: #ef4444; color: white; padding: 0.5rem 1.2rem; border-radius: 8px; font-weight: 800; font-size: 0.85rem; transition: var(--transition-fast); }
        .retry-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
 
        @media (max-width: 1024px) {
          .catalogue-layout { grid-template-columns: 1fr; gap: 1.5rem; }
          .cat-sidebar { position: static; }
          .sidebar-card { position: static; padding: 1.5rem; }
          .cat-hero-title { font-size: 2rem; }
          .product-flow.list .premium-card { flex-direction: column; height: auto; }
          .product-flow.list .card-media { width: 100%; height: 200px; }
        }
        @media (max-width: 640px) {
          .cat-hero-banner { padding: 2.5rem 0 2rem; margin-bottom: 1.5rem; }
          .cat-hero-title { font-size: 1.6rem; }
          .cat-hero-sub { font-size: 0.95rem; }
          .catalogue-layout { padding-bottom: 3rem; }
          .cat-toolbar-bar { flex-direction: column; align-items: stretch; gap: 1rem; padding: 1rem; }
          .toolbar-left { flex-wrap: wrap; }
          .toolbar-right { justify-content: space-between; gap: 1rem; }
          .product-flow.grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .card-media { height: 200px; padding: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default Catalogue;
