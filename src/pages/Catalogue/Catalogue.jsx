import { useState, useEffect, useCallback } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { Grid, List as ListIcon, Star, SlidersHorizontal, ChevronRight, X, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProducts, getCategories } from '../../services/api';
import Loader from '../../components/Loader/Loader';
import './Catalogue.css';

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

    </div>
  );
};

export default Catalogue;
