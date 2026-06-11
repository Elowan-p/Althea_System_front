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
import { getCategories, getTopProducts } from '../services/api';
import Loader from '../components/common/Loader';

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
              desc: i18n.language.startsWith('ru')
                  ? `Специализированные решения для ${(cat.title || '').toLowerCase()}.`
                  : i18n.language.startsWith('en')
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

            <style>{`
                /* Hero Section Enhancements */
                .hero-section { height: 85vh; position: relative; overflow: hidden; margin-top: -1px; }
                .hero-carousel { height: 100%; position: relative; }
                .carousel-slide { 
                    position: absolute; inset: 0; 
                    background-size: cover; background-position: center; 
                    opacity: 0; transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1);
                    display: flex; align-items: center; justify-content: center;
                }
                .carousel-slide.active { opacity: 1; z-index: 10; }
                
                .hero-content { max-width: 900px; text-align: center; color: white; transform: translateY(30px); opacity: 0; transition: var(--transition); padding: 2rem; }
                .carousel-slide.active .hero-content { transform: translateY(0); opacity: 1; }
                
                .hero-badge { display: inline-block; background: var(--primary); padding: 0.6rem 1.2rem; border-radius: 99px; font-weight: 900; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.15em; margin-bottom: 2rem; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
                .hero-title { font-size: 4.5rem; font-weight: 950; letter-spacing: -0.05em; line-height: 1; margin-bottom: 1.5rem; }
                .hero-desc { font-size: 1.4rem; opacity: 0.9; line-height: 1.5; margin-bottom: 3.5rem; font-weight: 400; }
                
                .hero-actions { display: flex; gap: 1.5rem; justify-content: center; }
                .btn-primary-lg { background: var(--primary-gradient); color: white; padding: 1.2rem 2.5rem; border-radius: 16px; font-weight: 800; display: flex; align-items: center; gap: 1rem; font-size: 1.1rem; transition: var(--transition); box-shadow: 0 8px 20px rgba(0, 92, 151, 0.25); }
                .btn-primary-lg:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 16px 35px rgba(0, 92, 151, 0.4); }
                .btn-outline-white { border: 2px solid white; color: white; padding: 1.2rem 2.5rem; border-radius: 16px; font-weight: 800; font-size: 1.1rem; transition: var(--transition); }
                .btn-outline-white:hover { background: white; color: var(--primary); transform: translateY(-4px) scale(1.02); box-shadow: 0 10px 25px rgba(255,255,255,0.2); }
 
                .carousel-nav { position: absolute; width: 100%; top: 50%; transform: translateY(-50%); display: flex; justify-content: space-between; padding: 0 3rem; z-index: 30; pointer-events: none; }
                .nav-arrow { width: 60px; height: 60px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: var(--transition); pointer-events: all; }
                .nav-arrow:hover { background: white; color: var(--primary); transform: scale(1.1); box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
 
                /* Values Section */
                .values-section { padding: 8rem 0; background: white; }
                .values-header { text-align: center; margin-bottom: 5rem; }
                .values-header label { font-size: 0.75rem; font-weight: 900; color: var(--primary); text-transform: uppercase; letter-spacing: 0.2rem; display: block; margin-bottom: 1rem; }
                .values-header h2 { font-size: 3rem; font-weight: 950; color: var(--secondary); letter-spacing: -0.04em; }
                .values-header p { font-size: 1.1rem; color: var(--text-muted); margin-top: 1rem; max-width: 600px; margin-inline: auto; }
 
                .values-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3rem; }
                .value-card { padding: 3rem; border-radius: 24px; text-align: center; border: 1px solid var(--border); transition: var(--transition); }
                .value-card:hover { transform: translateY(-10px); box-shadow: var(--shadow-premium); border-color: transparent; }
                .value-icon { color: var(--primary); margin-bottom: 2rem; transition: var(--transition-fast); }
                .value-card:hover .value-icon { transform: scale(1.1); }
                .value-card h4 { font-size: 1.5rem; font-weight: 900; color: var(--secondary); margin-bottom: 1rem; }
                .value-card p { font-size: 1rem; color: var(--text-muted); line-height: 1.5; }
 
                /* Categories Premium */
                .categories-section { padding: 8rem 0; background: hsl(210, 40%, 98%); }
                .section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4rem; }
                .section-header h3 { font-size: 2.5rem; font-weight: 950; color: var(--secondary); letter-spacing: -0.03em; }
                .text-cta { display: flex; align-items: center; gap: 10px; font-weight: 900; color: var(--primary); text-decoration: none; font-size: 0.9rem; transition: var(--transition-fast); }
                .text-cta:hover { color: var(--primary-light); transform: translateX(5px); }
 
                .categories-grid-premium { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; }
                .cat-card-premium { 
                    position: relative; height: 450px; border-radius: 32px; overflow: hidden; 
                    display: flex; flex-direction: column; justify-content: flex-end; padding: 2.5rem;
                    text-decoration: none; border: 1px solid var(--border);
                    transition: var(--transition);
                }
                .cat-card-premium:hover { transform: translateY(-8px); box-shadow: var(--shadow-premium); }
                .cat-image-bg { position: absolute; inset: 0; background-size: cover; background-position: center; transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                .cat-card-premium:hover .cat-image-bg { transform: scale(1.08); }
                .cat-card-premium::after { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 60%, transparent 100%); z-index: 1; transition: var(--transition); }
                .cat-card-premium:hover::after { opacity: 0.9; }
                
                .cat-content { position: relative; z-index: 10; color: white; width: 100%; }
                .cat-icon-box { margin-bottom: 1.5rem; color: rgba(255,255,255,0.85); transition: var(--transition-fast); }
                .cat-card-premium:hover .cat-icon-box { transform: scale(1.1); color: var(--primary-light); }
                .cat-info h4 { font-size: 1.6rem; font-weight: 950; margin-bottom: 0.5rem; }
                .cat-info p { font-size: 0.9rem; opacity: 0.75; margin-bottom: 2rem; line-height: 1.4; }
                
                .cat-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 1.5rem; }
                .cat-footer span { font-weight: 800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; }
                .nav-circ { width: 36px; height: 36px; background: white; color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: var(--transition-fast); }
                .cat-card-premium:hover .nav-circ { background: var(--primary-light); color: white; transform: scale(1.1) rotate(360deg); }
 
                /* Products Premium */
                .top-products-section { padding: 8rem 0; background: white; }
                .products-grid-premium { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3rem; }
                .prod-card-premium { display: flex; flex-direction: column; background: white; border-radius: 24px; overflow: hidden; border: 1px solid var(--border); transition: var(--transition); }
                .prod-card-premium:hover { transform: translateY(-8px); box-shadow: var(--shadow-premium); border-color: hsl(214, 32%, 80%); }
                
                .prod-image { position: relative; height: 320px; background: hsl(210, 40%, 97%); display: flex; align-items: center; justify-content: center; padding: 2rem; transition: var(--transition); }
                .prod-image img { max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
                .prod-card-premium:hover .prod-image img { transform: scale(1.06); }
                .prod-badge { position: absolute; top: 1.5rem; left: 1.5rem; background: white; padding: 0.5rem 1.1rem; border-radius: 99px; font-size: 0.7rem; font-weight: 900; color: var(--primary); border: 1px solid var(--border); box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
                
                .prod-actions-overlay { position: absolute; inset: 0; background: rgba(0, 92, 151, 0.05); opacity: 0; transition: var(--transition); display: flex; align-items: center; justify-content: center; }
                .prod-card-premium:hover .prod-actions-overlay { opacity: 1; }
                .view-btn { background: white; color: var(--primary); padding: 0.8rem 1.8rem; border-radius: 14px; font-weight: 900; text-decoration: none; box-shadow: 0 8px 20px rgba(0,0,0,0.06); transition: var(--transition-fast); transform: translateY(10px); }
                .prod-card-premium:hover .view-btn { transform: translateY(0); }
                .view-btn:hover { background: var(--primary); color: white; }
 
                .prod-details { padding: 2rem; border-top: none; }
                .prod-rating { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.75rem; }
                .prod-details h4 { font-size: 1.4rem; font-weight: 950; color: var(--secondary); margin-bottom: 1.25rem; }
                
                .prod-footer { display: flex; justify-content: space-between; align-items: center; }
                .prod-price { font-size: 1.8rem; font-weight: 900; color: var(--primary); letter-spacing: -0.02em; }
                .add-cart-mini { background: rgba(241, 245, 249, 0.8); color: var(--primary); padding: 0.65rem 1.3rem; border-radius: 12px; font-weight: 800; font-size: 0.85rem; transition: var(--transition-fast); }
                .add-cart-mini:hover { background: var(--primary-gradient); color: white; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,92,151,0.2); }
 
                @media (max-width: 1024px) {
                    .hero-title { font-size: 2.5rem; }
                    .hero-desc { font-size: 1.15rem; }
                    .values-grid { grid-template-columns: 1fr; }
                    .categories-grid-premium { grid-template-columns: 1fr 1fr; }
                    .products-grid-premium { grid-template-columns: 1fr; }
                    .values-section, .categories-section, .top-products-section { padding: 5rem 0; }
                }
                @media (max-width: 640px) {
                    .hero-section { height: 75vh; min-height: 480px; }
                    .hero-content { padding: 1.5rem; }
                    .hero-badge { margin-bottom: 1.25rem; }
                    .hero-title { font-size: 2rem; margin-bottom: 1rem; }
                    .hero-desc { font-size: 1rem; margin-bottom: 2rem; }
                    .hero-actions { flex-direction: column; align-items: stretch; gap: 1rem; }
                    .btn-primary-lg, .btn-outline-white { display: flex; align-items: center; justify-content: center; padding: 1rem 1.5rem; font-size: 1rem; }
                    .carousel-nav { padding: 0 1rem; }
                    .nav-arrow { width: 44px; height: 44px; }
                    .values-section, .categories-section, .top-products-section { padding: 3.5rem 0; }
                    .values-header { margin-bottom: 2.5rem; }
                    .values-header h2 { font-size: 2rem; }
                    .value-card { padding: 2rem; }
                    .values-grid { gap: 1.5rem; }
                    .section-header { flex-direction: column; align-items: flex-start; gap: 1rem; margin-bottom: 2.5rem; }
                    .section-header h3 { font-size: 1.75rem; }
                    .categories-grid-premium { grid-template-columns: 1fr; gap: 1.5rem; }
                    .cat-card-premium { height: 380px; padding: 1.5rem; }
                    .products-grid-premium { gap: 2rem; }
                    .prod-image { height: 240px; }
                    .prod-details { padding: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default Home;
