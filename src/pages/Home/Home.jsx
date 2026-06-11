import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { 
  ArrowRight, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  Zap,
  Activity,
  Layers,
  Dna,
  Warehouse
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCategories, getTopProducts } from '../../services/api';
import Loader from '../../components/Loader/Loader';
import './Home.css';

const categoryIconMap = {
    'Surgical Systems': <Activity size={32} />,
    'Diagnostic Imaging': <Layers size={32} />,
    'Lab Automation': <Dna size={32} />,
    'Infrastructure': <Warehouse size={32} />,
    'Surgical Equipment': <Activity size={32} />,
    'Diagnostics': <Layers size={32} />,
    'Laboratory Tools': <Dna size={32} />,
    'Ward Furniture': <Warehouse size={32} />,
};

const Home = () => {
    const { t, i18n } = useTranslation();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    const slides = [
        {
          id: 1,
          image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop',
          title: t('home.slide1_title', 'Precision in Every Solution'),
          desc: t('home.slide1_desc', 'Top-tier medical hardware trusted by leading clinics worldwide. Engineered for zero-failure performance.'),
          cta: t('home.slide1_cta', 'Explore Products')
        },
        {
          id: 2,
          image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2070&auto=format&fit=crop',
          title: t('home.slide2_title', 'Advanced Diagnostic Tools'),
          desc: t('home.slide2_desc', 'Next-generation scanners and imaging technology. High-fidelity imaging for life-critical diagnostics.'),
          cta: t('home.slide2_cta', 'Learn More')
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
          setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const currentLang = i18n.language;

    useEffect(() => {
        const fetchData = async () => {
          try {
            const [catsRes, topProdsRes] = await Promise.all([
              getCategories(),
              getTopProducts()
            ]);

            const catsData = Array.isArray(catsRes.data) ? catsRes.data : [];
            setCategories(catsData.map(cat => ({
              id: cat.id,
              name: cat.title,
              icon: categoryIconMap[cat.title] || <Activity size={32} />,
              image: cat.pictureUrl || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop',
              desc: currentLang.startsWith('ru')
                  ? `Специализированные решения для ${(cat.title || '').toLowerCase()}.`
                  : currentLang.startsWith('en')
                    ? `Specialized solutions for ${(cat.title || '').toLowerCase()}.`
                    : `Solutions spécialisées pour ${(cat.title || '').toLowerCase()}.`
            })));

            const topProdsData = Array.isArray(topProdsRes.data) ? topProdsRes.data : [];
            setTopProducts(topProdsData.map(prod => ({
              id: prod.product?.id ?? prod.id,
              name: prod.product?.title ?? prod.title,
              price: `$${Number(prod.product?.price ?? prod.price).toLocaleString()}`,
              rating: 4.8,
              medicalDomain: prod.product?.medicalDomain ?? prod.product?.category?.title ?? prod.medicalDomain ?? prod.category?.title ?? 'Medical',
              image: prod.product?.pictureUrl ?? prod.pictureUrl ?? null
            })));
          } catch (err) {
            console.error('Home Data Fetch Error:', err);
          } finally {
            setLoading(false);
          }
        };
        fetchData();
    }, [currentLang]);

    if (loading) return <Loader />;

    return (
        <div className="home-page">
            {}
            <section className="hero-section">
                <div className="hero-carousel">
                    {slides.map((slide, idx) => (
                        <div key={slide.id} className={`carousel-slide ${idx === currentSlide ? 'active' : ''}`} style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.2)), url(${slide.image})` }}>
                            <div className="hero-content">
                                <span className="hero-badge">Althea Innovation 2026</span>
                                <h1 className="hero-title">{slide.title}</h1>
                                <p className="hero-desc">{slide.desc}</p>
                                <div className="hero-actions">
                                    <NavLink to="/catalogue" className="btn-primary-lg">
                                        {slide.cta} <ArrowRight size={20} />
                                    </NavLink>
                                    <NavLink to="/contact" className="btn-outline-white">{t('header.technical_support', 'Support Center')}</NavLink>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="carousel-nav">
                        <button onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)} className="nav-arrow"><ChevronLeft size={30} /></button>
                        <button onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)} className="nav-arrow"><ChevronRight size={30} /></button>
                    </div>
                </div>
            </section>

            {}
            <section className="values-section">
                <div className="container">
                    <div className="values-header">
                        <label>{t('home.excellence_label', 'Excellence in Service')}</label>
                        <h2>{t('home.standard_title', 'The Althea Standard')}</h2>
                        <p>{t('home.standard_desc', 'We provide foundational infrastructure for the next generation of patient care.')}</p>
                    </div>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon"><ShieldCheck size={40} /></div>
                            <h4>{t('footer.certified_quality', 'Certified Quality')}</h4>
                            <p>{t('home.certified_quality_desc', 'Full ISO 13485 compliance for critical medical applications.')}</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon"><Truck size={40} /></div>
                            <h4>{t('home.global_logistics_title', 'Global Logistics')}</h4>
                            <p>{t('home.global_logistics_desc', 'Direct supply chain to 120+ countries with cold-chain support.')}</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon"><Zap size={40} /></div>
                            <h4>{t('home.tech_hub_title', '24/7 Tech Hub')}</h4>
                            <p>{t('home.tech_hub_desc', 'Live technical monitoring and on-site expert maintenance.')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {}
            <section className="categories-section">
                <div className="container">
                    <div className="section-header">
                        <h3>{t('home.divisions_title', 'Institutional Divisions')}</h3>
                        <NavLink to="/catalogue" className="text-cta">{t('home.see_all', 'See All Categories')} <ArrowRight size={16} /></NavLink>
                    </div>
                    {categories.length > 0 ? (
                        <div className="categories-grid-premium">
                            {categories.map(cat => (
                                <NavLink key={cat.id} to={`/category/${cat.id}`} className="cat-card-premium">
                                    <div className="cat-image-bg" style={{ backgroundImage: `url(${cat.image})` }}></div>
                                    <div className="cat-content">
                                        <div className="cat-icon-box">{cat.icon}</div>
                                        <div className="cat-info">
                                            <h4>{cat.name}</h4>
                                            <p>{cat.desc}</p>
                                        </div>
                                        <div className="cat-footer">
                                            <span>{t('home.enter_division', 'Enter Division')}</span>
                                            <div className="nav-circ"><ChevronRight size={18} /></div>
                                        </div>
                                    </div>
                                </NavLink>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>{t('home.no_categories', 'No connected categories are available yet.')}</p>
                            <NavLink to="/catalogue" className="btn-primary">{t('home.see_all', 'Browse Products')}</NavLink>
                        </div>
                    )}
                </div>
            </section>

            {}
            <section className="top-products-section">
                <div className="container">
                    <div className="section-header">
                        <h3>{t('home.critical_assets', 'Critical Assets')}</h3>
                        <p>{t('home.critical_assets_desc', 'Recently deployed technologies in European hospitals.')}</p>
                    </div>
                    <div className="products-grid-premium">
                        {topProducts.map(prod => (
                            <div key={prod.id} className="prod-card-premium">
                                <div className="prod-image">
                                    <img src={prod.image} alt={prod.name} />
                                    <div className="prod-badge">{prod.medicalDomain}</div>
                                    <div className="prod-actions-overlay">
                                        <NavLink to={`/product/${prod.id}`} className="view-btn">{t('search_page.full_specs', 'Full Specs')}</NavLink>
                                    </div>
                                </div>
                                <div className="prod-details">
                                    <div className="prod-rating">
                                        <Star size={14} fill="#fbbf24" color="#fbbf24" />
                                        <span>{prod.rating} {t('home.internal_rating', 'Internal Rating')}</span>
                                    </div>
                                    <h4>{prod.name}</h4>
                                    <div className="prod-footer">
                                        <span className="prod-price">{prod.price}</span>
                                        <button className="add-cart-mini">{t('product.add_to_cart')}</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
