import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Send, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Hospital, 
  MessageSquare, 
  CheckCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { sendMessage } from '../services/api';

const Contact = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    hospital: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    
    const fullMessage = `Name: ${formData.name}\nHospital: ${formData.hospital}\n\nMessage:\n${formData.message}`;

    try {
      await sendMessage({
        email: formData.email,
        subject: formData.subject,
        message: fullMessage,
        source: 'form'
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setError(err.response?.data?.error || "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="contact-submitted-view transition-in">
        <div className="container">
          <div className="success-card card">
             <div className="icon-pulse"><CheckCircle size={60} color="#10b981" /></div>
             <h2>Message Received</h2>
             <p>Our medical coordination team will review your inquiry and get back to you within 24 business hours.</p>
             <button className="btn-primary" onClick={() => {
                setFormData({
                  name: '',
                  email: '',
                  hospital: '',
                  subject: 'General Inquiry',
                  message: ''
                });
                setSubmitted(false);
             }}>Send another message</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      {}
      <section className="contact-hero">
        <div className="container">
          <div className="hero-content-wrap">
            <h1>{t('contact.hero_title', 'Global Medical Support')}</h1>
            <p>{t('contact.hero_desc', 'Connect with our experts for equipment inquiries, technical support, or institutional partnerships.')}</p>
          </div>
        </div>
      </section>

      <section className="contact-body-section container">
        <div className="contact-grid">
          
          {}
          <div className="contact-form-card card shadow-lg">
             <div className="form-header">
                <h3>{t('contact.form_title', 'Send a Message')}</h3>
                <p>{t('contact.form_desc', 'Fields marked with * are required for professional verification.')}</p>
             </div>
             
             <form onSubmit={handleSubmit}>
                <div className="form-row">
                   <div className="field-group">
                      <label>{t('contact.name_label', 'Full Name *')}</label>
                      <input 
                         type="text" 
                         placeholder={t('contact.name_placeholder', 'Dr. John Doe')} 
                         required 
                         value={formData.name}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                   </div>
                   <div className="field-group">
                      <label>{t('contact.email_label', 'Email Address *')}</label>
                      <input 
                         type="email" 
                         placeholder={t('contact.email_placeholder', 'john.doe@clinic.com')} 
                         required 
                         value={formData.email}
                         onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                   </div>
                </div>

                <div className="field-group">
                   <label>{t('contact.hospital_label', 'Hospital / Institution Name *')}</label>
                   <div className="input-with-icon">
                      <Hospital size={16} />
                      <input 
                         type="text" 
                         placeholder={t('contact.hospital_placeholder', 'General City Hospital')} 
                         required 
                         value={formData.hospital}
                         onChange={e => setFormData({...formData, hospital: e.target.value})}
                      />
                   </div>
                </div>

                <div className="field-group">
                   <label>{t('contact.subject_label', 'Inquiry Subject')}</label>
                   <select 
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                   >
                      <option value="General Inquiry">{t('contact.subject_general', 'General Inquiry')}</option>
                      <option value="Sales & Quotes">{t('contact.subject_sales', 'Sales & Quotes')}</option>
                      <option value="Technical Support">{t('contact.subject_support', 'Technical Support')}</option>
                      <option value="Vendor Partnership">{t('contact.subject_partnership', 'Vendor Partnership')}</option>
                   </select>
                </div>

                <div className="field-group">
                   <label>{t('contact.msg_label', 'Your Message *')}</label>
                   <textarea 
                      rows="6" 
                      placeholder={t('contact.msg_placeholder', 'Please describe your needs in detail...')} 
                      required
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                   ></textarea>
                </div>

                {error && (
                   <div className="form-error-msg" style={{ color: '#ef4444', marginBottom: '1.2rem', fontSize: '0.95rem', fontWeight: 600 }}>
                      {error}
                   </div>
                )}

                <button type="submit" className="submit-btn" disabled={loading}>
                   {loading ? (
                      <><Loader2 size={18} className="adm-spin" /> {t('contact.sending')}</>
                   ) : (
                      <><Send size={18} /> {t('contact.send')}</>
                   )}
                </button>
             </form>
          </div>

          {}
          <div className="contact-info-wrap">
             <div className="info-block card">
                <header className="block-header">
                   <MapPin size={24} />
                   <h4>{t('contact.hq_title', 'Global Headquarters')}</h4>
                </header>
                <div className="block-content">
                   <p>{t('contact.hq_address', '128 Medical Row, Berlin')}</p>
                   <p>{t('contact.hq_city', '10115 Brandenburg, Germany')}</p>
                </div>
             </div>

             <div className="info-block card">
                <header className="block-header">
                   <Phone size={24} />
                   <h4>{t('contact.lines_title', 'Direct Lines')}</h4>
                </header>
                <div className="block-content">
                   <p><strong>{t('contact.lines_primary', 'Primary')}:</strong> +49 (0) 30 123 4567</p>
                   <p><strong>{t('contact.lines_technical', 'Technical')}:</strong> +49 (0) 30 123 9999</p>
                </div>
             </div>

             <div className="info-block card">
                <header className="block-header">
                   <Clock size={24} />
                   <h4>{t('contact.hours_title', 'Support Hours')}</h4>
                </header>
                <div className="block-content">
                   <p><strong>{t('contact.hours_b2b', 'B2B Support')}:</strong> {t('contact.hours_b2b_detail', 'Mon - Fri, 8:00 - 18:00 CET')}</p>
                   <p><strong>{t('contact.hours_hotline', '24/7 Hotline')}:</strong> {t('contact.hours_hotline_detail', 'Registered Premium Clients Only')}</p>
                </div>
             </div>

             <div className="faq-tease card">
                <HelpCircle size={32} color="var(--primary)" />
                <h5>{t('contact.help_title', 'Quick Help?')}</h5>
                <p>{t('contact.help_desc', 'Check our digital documentation before reaching out.')}</p>
                <NavLink to="/support" className="text-link">{t('contact.help_link', 'Go to Documentation')} &rarr;</NavLink>
             </div>
          </div>

        </div>
      </section>

      {}
      <section className="map-section container">
         <div className="map-placeholder">
            <div className="map-overlay">
               <div className="location-pin"><MapPin size={32} color="var(--white)" /></div>
               <p>{t('contact.map_overlay', 'Real-time location available on client portal')}</p>
            </div>
         </div>
      </section>

      <style>{`
        .contact-page { background: var(--white); }
        
        .contact-hero {
           background: linear-gradient(135deg, var(--primary) 0%, #003e68 100%);
           color: white;
           padding: 6rem 0;
           text-align: center;
        }
        .hero-content-wrap h1 { font-size: 3.5rem; font-weight: 800; margin-bottom: 1.2rem; line-height: 1.1; }
        .hero-content-wrap p { font-size: 1.25rem; opacity: 0.85; max-width: 700px; margin: 0 auto; }

        .contact-body-section { margin-top: -4rem; margin-bottom: 6rem; position: relative; z-index: 10; }
        .contact-grid { display: grid; grid-template-columns: 1fr 340px; gap: 3rem; }

        /* Form */
        .contact-form-card { padding: 3rem !important; }
        .form-header { margin-bottom: 2.5rem; }
        .form-header h3 { font-size: 1.8rem; font-weight: 700; margin-bottom: 0.5rem; }
        .form-header p { font-size: 0.9rem; color: var(--text-muted); }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .field-group { margin-bottom: 1.8rem; display: flex; flex-direction: column; gap: 0.6rem; }
        .field-group label { font-size: 0.85rem; font-weight: 700; color: #4a4e69; text-transform: uppercase; letter-spacing: 0.02em; }
        
        input, select, textarea {
           padding: 0.8rem 1.2rem;
           border-radius: 10px;
           border: 1px solid var(--border);
           background: var(--background);
           font-family: inherit;
           font-size: 1rem;
           transition: var(--transition);
        }
        input:focus, select:focus, textarea:focus { 
           border-color: var(--primary); 
           outline: none; 
           background: white;
           box-shadow: 0 0 0 4px rgba(0, 92, 151, 0.08);
        }

        .input-with-icon { position: relative; display: flex; align-items: center; }
        .input-with-icon svg { position: absolute; left: 1rem; color: var(--text-muted); }
        .input-with-icon input { padding-left: 2.8rem; width: 100%; }

        .submit-btn { 
           width: 100%; 
           padding: 1rem; 
           background: var(--primary); 
           color: white; 
           border-radius: 12px; 
           font-weight: 700; 
           font-size: 1rem; 
           display: flex; 
           align-items: center; 
           justify-content: center; 
           gap: 0.8rem; 
           transition: var(--transition);
           margin-top: 1rem;
        }
        .submit-btn:hover { background: #004b7c; transform: translateY(-2px); box-shadow: var(--shadow-lg); }

        /* Info Blocks */
        .contact-info-wrap { display: flex; flex-direction: column; gap: 1.5rem; }
        .info-block { padding: 1.5rem; }
        .block-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1rem; }
        .block-header svg { color: var(--primary); }
        .block-header h4 { font-size: 1rem; font-weight: 800; color: var(--primary); }
        .block-content p { font-size: 0.95rem; color: #4a4e69; line-height: 1.6; }
        
        .faq-tease { text-align: center; padding: 2rem !important; background: var(--background) !important; border: 1px dashed var(--primary); }
        .faq-tease h5 { font-size: 1.1rem; margin-top: 0.8rem; margin-bottom: 0.4rem; font-weight: 800; }
        .faq-tease p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; }
        .text-link { color: var(--primary); font-weight: 700; font-size: 0.9rem; }

        /* Map */
        .map-section { margin-bottom: 8rem; }
        .map-placeholder { 
           height: 400px; 
           background: #e5e7eb url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2066&auto=format&fit=crop') center;
           background-size: cover;
           border-radius: 24px;
           overflow: hidden;
           position: relative;
           box-shadow: var(--shadow);
        }
        .map-overlay { 
           position: absolute; 
           inset: 0; 
           background: rgba(1, 42, 74, 0.4); 
           backdrop-filter: blur(2px);
           display: flex; 
           flex-direction: column; 
           align-items: center; 
           justify-content: center; 
           color: white; 
           gap: 1rem;
        }
        .location-pin { background: var(--primary); width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 0 0 10px rgba(255,255,255,0.2); }

        /* Success View */
        .contact-submitted-view { padding: 10rem 0; text-align: center; }
        .success-card { max-width: 500px; margin: 0 auto; padding: 4rem !important; }
        .icon-pulse { animation: pulse 2s infinite; margin-bottom: 2rem; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        .success-card h2 { font-size: 2rem; margin-bottom: 1rem; color: var(--primary); }
        .success-card p { color: var(--text-muted); margin-bottom: 2.5rem; line-height: 1.6; }

        @media (max-width: 1024px) {
           .contact-grid { grid-template-columns: 1fr; }
           .contact-hero h1 { font-size: 2.2rem; }
        }
        @media (max-width: 768px) {
           .form-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
           .contact-hero { padding: 4rem 0; }
           .contact-hero h1 { font-size: 1.9rem; }
           .hero-content-wrap p { font-size: 1rem; }
           .contact-body-section { margin-top: -2.5rem; margin-bottom: 4rem; }
           .contact-grid { gap: 1.5rem; }
           .contact-form-card { padding: 1.5rem !important; }
           .form-header { margin-bottom: 1.5rem; }
           .form-header h3 { font-size: 1.5rem; }
           .map-section { margin-bottom: 4rem; }
           .map-placeholder { height: 260px; }
           .contact-submitted-view { padding: 5rem 0; }
           .success-card { padding: 2.5rem 1.5rem !important; }
        }
      `}</style>
    </div>
  );
};

export default Contact;
