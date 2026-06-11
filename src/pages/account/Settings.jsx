import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Building, Save, ShieldCheck, BellRing, MapPin } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '../../services/api';
import './Settings.css';

const Settings = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        siret: '',
        address: '',
        postalCode: '',
        city: '',
        country: '',
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getUserProfile();
                const u = response.data;
                setUser({
                    firstName: u.firstName || '',
                    lastName: u.lastName || '',
                    email: u.email || '',
                    phone: u.phone || '',
                    company: u.company || '',
                    siret: u.siret || '',
                    address: u.address || '',
                    postalCode: u.postalCode || '',
                    city: u.city || '',
                    country: u.country || '',
                });
            } catch (err) {
                console.error("Erreur lors de la récupération du profil", err);
                setError(t('settings.error_load', 'Impossible de charger les données du profil.'));
            } finally {
                setFetching(false);
            }
        };
        fetchProfile();
    }, [t]);

    const handleChange = (e) => {
        setUser({...user, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSaved(false);
        try {
            const response = await updateUserProfile(user);
            const u = response.data.user;
            setUser({
                firstName: u.firstName || '',
                lastName: u.lastName || '',
                email: u.email || '',
                phone: u.phone || '',
                company: u.company || '',
                siret: u.siret || '',
                address: u.address || '',
                postalCode: u.postalCode || '',
                city: u.city || '',
                country: u.country || '',
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 4000);
        } catch (err) {
            console.error("Erreur lors de la mise à jour du profil", err);
            setError(t('settings.error_save', 'Une erreur est survenue lors de la sauvegarde.'));
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="settings-page loading-state">
                <div className="spinner"></div>
                <p>{t('settings.loading', 'Chargement de votre profil institutionnel...')}</p>
                
            </div>
        );
    }

    return (
        <div className="settings-page">
            <header className="page-header">
                <h1 className="page-title">{t('settings.title', 'Profile Settings')}</h1>
                <p className="page-subtitle">{t('settings.subtitle', 'Manage your personal information and institutional preferences.')}</p>
            </header>

            <form onSubmit={handleSubmit} className="settings-grid">
                {error && (
                    <div className="error-alert">
                        <span>⚠️ {error}</span>
                    </div>
                )}

                <section className="settings-section">
                    <h3 className="section-title"><User size={18} /> {t('settings.basic_info', 'Basic Information')}</h3>
                    <div className="form-row">
                        <div className="input-group">
                            <label>{t('settings.first_name', 'First Name')}</label>
                            <input type="text" name="firstName" value={user.firstName} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>{t('settings.last_name', 'Last Name')}</label>
                            <input type="text" name="lastName" value={user.lastName} onChange={handleChange} required />
                        </div>
                    </div>
                </section>

                <section className="settings-section">
                    <h3 className="section-title"><Mail size={18} /> {t('settings.contact_info', 'Professional Contact')}</h3>
                    <div className="form-row">
                        <div className="input-group">
                            <label>{t('settings.email', 'Institutional Email')}</label>
                            <input type="email" name="email" value={user.email} disabled className="disabled-input" title={t('settings.email_readonly', "L'adresse email de connexion ne peut pas être modifiée.")} />
                        </div>
                        <div className="input-group">
                            <label>{t('settings.phone', 'Direct Phone')}</label>
                            <input type="text" name="phone" value={user.phone} onChange={handleChange} />
                        </div>
                    </div>
                </section>

                <section className="settings-section">
                    <h3 className="section-title"><Building size={18} /> {t('settings.organization', 'Organization')}</h3>
                    <div className="form-row">
                        <div className="input-group">
                            <label>{t('settings.company', 'Company / Hospital')}</label>
                            <input type="text" name="company" value={user.company} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>{t('settings.siret', 'SIRET / Company ID')}</label>
                            <input type="text" name="siret" value={user.siret} onChange={handleChange} />
                        </div>
                    </div>
                </section>

                <section className="settings-section">
                    <h3 className="section-title"><MapPin size={18} /> {t('settings.address_details', 'Address Details')}</h3>
                    <div className="input-group mb-4">
                        <label>{t('settings.street_address', 'Street Address')}</label>
                        <input type="text" name="address" value={user.address} onChange={handleChange} />
                    </div>
                    <div className="form-row">
                        <div className="input-group">
                            <label>{t('settings.postal_code', 'Postal Code')}</label>
                            <input type="text" name="postalCode" value={user.postalCode} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>{t('settings.city', 'City')}</label>
                            <input type="text" name="city" value={user.city} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="input-group mt-4">
                        <label>{t('settings.country', 'Country')}</label>
                        <input type="text" name="country" value={user.country} onChange={handleChange} />
                    </div>
                </section>

                <div className="form-actions">
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? t('settings.updating', 'Updating...') : <><Save size={18} /> {t('settings.save_changes', 'Save Workspace Changes')}</>}
                    </button>
                    {saved && <span className="save-success">{t('settings.success', '✓ Changes persisted successfully')}</span>}
                </div>
            </form>

            <div className="extra-options-grid mt-4">
                <div className="option-card">
                    <ShieldCheck size={24} className="text-primary" />
                    <div>
                        <h4>{t('settings.security_title', 'Security & 2FA')}</h4>
                        <p>{t('settings.security_desc', 'Protect your medical procurement access with Two-Factor Authentication.')}</p>
                    </div>
                </div>
                <div className="option-card">
                    <BellRing size={24} className="text-primary" />
                    <div>
                        <h4>{t('settings.notif_title', 'Notifications')}</h4>
                        <p>{t('settings.notif_desc', 'Configure alerts for order status, maintenance cycles, and compliance updates.')}</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Settings;
