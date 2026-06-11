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
import { sendMessage } from '../../services/api';
import './Contact.css';

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
                   <div className="form-error-msg">
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

    </div>
  );
};

export default Contact;
