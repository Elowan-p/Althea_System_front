import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, ArrowUp, Zap, ShieldCheck, HeartPulse } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const { t, i18n } = useTranslation();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const footerLinks = {
    solutions: [
      { name: t('footer.solutions_list.surgical', 'Surgical Imaging'), path: '/category/surgical' },
      { name: t('footer.solutions_list.lab', 'Laboratory Automation'), path: '/category/lab' },
      { name: t('footer.solutions_list.diagnostics', 'Patient Monitoring'), path: '/category/diagnostics' },
      { name: t('footer.solutions_list.ward', 'Hospital Infrastructure'), path: '/category/ward' }
    ],
    support: [
      { name: t('footer.expertise_list.maintenance', 'Maintenance Services'), path: '/services/maintenance' },
      { name: t('footer.expertise_list.regulatory', 'Regulatory Support'), path: '/services/regulatory' },
      { name: t('footer.expertise_list.logistics', 'Logistics & Warehousing'), path: '/services/logistics' },
      { name: t('footer.expertise_list.training', 'Technical Training'), path: '/services/training' }
    ],
    company: [
      { name: t('footer.company_list.identity', 'Our Identity'), path: '/about' },
      { name: t('footer.company_list.network', 'Global Network'), path: '/network' },
      { name: t('footer.company_list.innovation', 'Innovation Hub'), path: '/innovation' },
      { name: t('footer.company_list.careers', 'Career Opportunities'), path: '/careers' }
    ]
  };

  return (
    <footer className="footer-premium">
      {}
      <div className="footer-values">
        <div className="container">
          <div className="value-item">
             <ShieldCheck size={28} />
             <div className="v-meta">
               <strong>{t('footer.certified_quality', 'Certified Quality')}</strong>
               <span>{t('footer.iso_compliance', 'ISO 13485:2016 Compliant')}</span>
             </div>
          </div>
          <div className="value-item">
             <Zap size={28} />
             <div className="v-meta">
               <strong>{t('footer.express_logistics', 'Express Logistics')}</strong>
               <span>{t('footer.medical_supply', 'Next-day medical supply')}</span>
             </div>
          </div>
          <div className="value-item">
             <HeartPulse size={28} />
             <div className="v-meta">
               <strong>{t('footer.life_support', '24/7 Life Support')}</strong>
               <span>{t('footer.emergency_assistance', 'Emergency technical assistance')}</span>
             </div>
          </div>
        </div>
      </div>

      {}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {}
            <div className="footer-col brand-col">
              <NavLink to="/" className="brand-footer">
                <span className="b-main">ALTHEA</span>
                <span className="b-accent">SYSTEMS</span>
              </NavLink>
              <p className="footer-desc">
                {t('footer.brand_desc', 'Pioneering medical excellence through high-end hardware and smarter infrastructure solutions since 2012. Trusted by 2,500+ clinics worldwide.')}
              </p>
              <div className="social-links">
                <a href="#"><Facebook size={20} /></a>
                <a href="#"><Twitter size={20} /></a>
                <a href="#"><Linkedin size={20} /></a>
              </div>
            </div>

            {}
            <div className="footer-col">
              <h4>{t('footer.solutions', 'Solutions')}</h4>
              <ul>
                {footerLinks.solutions.map(l => <li key={l.name}><NavLink to={l.path}>{l.name}</NavLink></li>)}
              </ul>
            </div>
            <div className="footer-col">
              <h4>{t('footer.expertise', 'Expertise')}</h4>
              <ul>
                {footerLinks.support.map(l => <li key={l.name}><NavLink to={l.path}>{l.name}</NavLink></li>)}
              </ul>
            </div>

            {}
            <div className="footer-col contact-col">
              <h4>{t('footer.connect', 'Connect')}</h4>
              <ul className="contact-list">
                <li><MapPin size={18} /> {t('contact.hq_address', '128 Medical Row, Berlin')}, {i18n.language.startsWith('fr') ? 'Allemagne' : (i18n.language.startsWith('ru') ? 'Германия' : 'Germany')}</li>
                <li><Phone size={18} /> +49 (0) 30 1234 5678</li>
                <li><Mail size={18} /> systems@althea.med</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="footer-bottom">
        <div className="container bottom-wrap">
          <p className="copyright">{t('footer.rights_reserved', '© 2026 Althea Systems AG. All rights reserved.')}</p>
          <div className="legal-links">
             <NavLink to="/legal/privacy">{t('footer.privacy_policy', 'Privacy Policy')}</NavLink>
             <NavLink to="/legal/terms">{t('footer.terms_of_service', 'Terms of Service')}</NavLink>
             <NavLink to="/legal/compliance">{t('footer.cookie_policy', 'Cookie Policy')}</NavLink>
          </div>
          <button className="back-to-top" onClick={scrollToTop}>
            <ArrowUp size={18} />
          </button>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
