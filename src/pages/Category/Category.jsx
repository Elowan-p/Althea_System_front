import { useParams, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Filter, Grid, List as ListIcon, Star, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCategory } from '../../services/api';
import Loader from '../../components/Loader/Loader';
import './Category.css';

const Category = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [viewMode, setViewMode] = useState('grid');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);

  const currentLang = i18n.language;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catRes = await getCategory(id);
        setCategory(catRes.data);
        setProducts(catRes.data?.products || []);
      } catch (err) {
        console.error("Error fetching category data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentLang]);

  const categoryName = category?.title || t('category_page.default_title', "Medical Equipment");

  if (loading) return <Loader />;

  return (
    <div className="category-page modern-bg">
      {}
      <section className="cat-hero">
        <div className="container">
          <nav className="cat-breadcrumbs">
            <NavLink to="/">{t('catalogue.breadcrumb_home')}</NavLink>
            <ChevronRight size={12} />
            <span className="active">{categoryName}</span>
          </nav>
          
          <div className="hero-content">
            <h1 className="hero-title">{categoryName}</h1>
            <p className="hero-subtitle">{t('category_page.hero_subtitle', { category: categoryName.toLowerCase(), defaultValue: `Discover state-of-the-art technological solutions specialized in ${categoryName.toLowerCase()}. Engineered for precision, integrated for performance.` })}</p>
          </div>
        </div>
      </section>

      {}
      <div className="container cat-main">
        <div className="cat-toolbar card-glass">
            <div className="toolbar-sec">
                <button className="btn-filter">
                    <SlidersHorizontal size={18} />
                    <span>{t('category_page.filter_refine', 'Filter & Refine')}</span>
                </button>
                <div className="results-badge">
                    <strong>{products.length}</strong> {products.length === 1 ? t('catalogue.products_count_one', 'produit trouvé') : t('catalogue.products_count_other', 'produits trouvés')}
                </div>
            </div>

            <div className="toolbar-sec">
                <div className="view-toggle">
                    <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><Grid size={18} /></button>
                    <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><ListIcon size={18} /></button>
                </div>
                <div className="sort-group">
                    <label>{t('catalogue.sort_by', 'Sort By:')}</label>
                    <select className="minimal-select">
                        <option>{t('category_page.sort_featured', 'Featured')}</option>
                        <option>{t('catalogue.sort_price_asc', 'Price: Low to High')}</option>
                        <option>{t('catalogue.sort_price_desc', 'Price: High to Low')}</option>
                    </select>
                </div>
            </div>
        </div>

        <div className={`product-flow ${viewMode}`}>
            {products.map(prod => (
                <NavLink to={`/product/${prod.id}`} key={prod.id} className="premium-card">
                    <div className="card-media">
                        <img src={prod.pictureUrl || '/images/prod_scanner.png'} alt={prod.title} />
                        {prod.inStock <= 0 && <span className="tag-oos">{t('catalogue.limited_supply', 'Limited Availability')}</span>}
                        <div className="card-overlay">
                           <button className="view-detail-btn">{t('category_page.quick_view', 'Quick View')}</button>
                        </div>
                    </div>
                    
                    <div className="card-info">
                        <div className="info-top">
                            <span className="cat-tag">{prod.medicalDomain}</span>
                            <div className="rating">
                                <Star size={12} fill="var(--accent)" color="var(--accent)" />
                                <span>4.9</span>
                            </div>
                        </div>
                        <h3 className="item-title">{prod.title}</h3>
                        <div className="info-bottom">
                            <span className="item-price">${Number(prod.price).toLocaleString()}</span>
                            <div className="stock-status">
                                <div className={`dot ${prod.inStock > 0 ? 'online' : 'offline'}`}></div>
                                <span>{prod.inStock > 0 ? t('catalogue.in_stock', "In Stock") : t('catalogue.out_of_stock', "Out of Stock")}</span>
                            </div>
                        </div>
                    </div>
                </NavLink>
            ))}
        </div>

        {products.length === 0 && (
            <div className="empty-state">
                <p>{t('category_page.no_equipment', 'No equipment currently available in this specialized division.')}</p>
                <NavLink to="/search" className="btn-primary">{t('category_page.explore_catalogue', 'Explore General Catalogue')}</NavLink>
            </div>
        )}
      </div>

    </div>
  );
};

export default Category;
