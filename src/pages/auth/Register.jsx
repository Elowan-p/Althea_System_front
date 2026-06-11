import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User as UserIcon,
  Building,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  MapPin,
  Hash,
  Globe as GlobeIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { register } from '../../services/api';
import Loader from '../../components/Loader/Loader';
import './Register.css';

const Register = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        siret: '',
        phone: '',
        address: '',
        postalCode: '',
        city: '',
        country: 'France',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await register(formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            console.error('Registration Error:', err);
            setError(err.response?.data?.error || err.response?.data?.message || t('auth.register_failed'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-visual desktop-only">
                    <div className="visual-overlay">
                        <div className="visual-content">
                            <div className="visual-badge">{t('auth.register_visual_badge')}</div>
                            <h1>{t('auth.register_visual_title')}</h1>
                            <p>{t('auth.register_visual_desc')}</p>

                            <div className="visual-stats">
                                <div className="v-stat">
                                    <strong>{t('auth.register_visual_stat_cat')}</strong>
                                    <span>{t('auth.register_visual_stat_cat_sub')}</span>
                                </div>
                                <div className="v-stat">
                                    <strong>{t('auth.register_visual_stat_acct')}</strong>
                                    <span>{t('auth.register_visual_stat_acct_sub')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-form-side">
                    <div className="form-card">
                        <header className="auth-header">
                            <NavLink to="/" className="auth-logo">
                                <span className="sym">A</span>
                                <span className="txt">ALTHEA</span>
                            </NavLink>
                            <h2>{t('auth.register_title')}</h2>
                            <p>{t('auth.register_subtitle')}</p>
                        </header>

                        {success ? (
                            <div className="success-panel pulse">
                                <ShieldCheck size={56} />
                                <h3>{t('auth.register_success_title')}</h3>
                                <p>{t('auth.register_success_desc')}</p>
                                <NavLink to="/login" className="btn-auth-submit inline-submit">
                                    {t('auth.register_success_btn')}
                                </NavLink>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="auth-error pulse">
                                        <AlertCircle size={18} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="auth-form">
                                    <div className="form-row">
                                        <div className="field-group">
                                            <label>{t('auth.first_name')}</label>
                                            <div className="input-icon-wrap">
                                                <UserIcon size={18} />
                                                <input type="text" name="firstName" placeholder="Jean" required value={formData.firstName} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="field-group">
                                            <label>{t('auth.last_name')}</label>
                                            <div className="input-icon-wrap">
                                                <UserIcon size={18} />
                                                <input type="text" name="lastName" placeholder="Dupont" required value={formData.lastName} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="field-group">
                                        <label>{t('auth.email_prof')}</label>
                                        <div className="input-icon-wrap">
                                            <Mail size={18} />
                                            <input type="email" name="email" placeholder="nom@etablissement.fr" required value={formData.email} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="field-group">
                                            <label>{t('auth.company')}</label>
                                            <div className="input-icon-wrap">
                                                <Building size={18} />
                                                <input type="text" name="company" placeholder="Clinique Althea" required value={formData.company} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="field-group">
                                            <label>{t('auth.siret')}</label>
                                            <div className="input-icon-wrap">
                                                <Hash size={18} />
                                                <input type="text" name="siret" placeholder="123 456 789 00012" value={formData.siret} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="field-group">
                                        <label>{t('auth.address')}</label>
                                        <div className="input-icon-wrap">
                                            <MapPin size={18} />
                                            <input type="text" name="address" placeholder="12 rue de la Paix" value={formData.address} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="field-group">
                                            <label>{t('auth.postal_code')}</label>
                                            <div className="input-icon-wrap">
                                                <Hash size={18} />
                                                <input type="text" name="postalCode" placeholder="75000" value={formData.postalCode} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="field-group">
                                            <label>{t('auth.city')}</label>
                                            <div className="input-icon-wrap">
                                                <MapPin size={18} />
                                                <input type="text" name="city" placeholder="Paris" value={formData.city} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="field-group">
                                            <label>{t('auth.country')}</label>
                                            <div className="input-icon-wrap">
                                                <GlobeIcon size={18} />
                                                <input type="text" name="country" placeholder="France" value={formData.country} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="field-group">
                                            <label>{t('auth.phone')}</label>
                                            <div className="input-icon-wrap">
                                                <Phone size={18} />
                                                <input type="tel" name="phone" placeholder="+33 6 00 00 00 00" required value={formData.phone} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="field-group">
                                        <label>{t('auth.password')}</label>
                                        <div className="input-icon-wrap">
                                            <Lock size={18} />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                placeholder="••••••••"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                            <button type="button" className="eye-toggle" onClick={() => setShowPassword((prev) => !prev)}>
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-auth-submit">
                                        <span>{t('auth.register_btn')}</span>
                                        <ArrowRight size={20} />
                                    </button>
                                </form>

                                <footer className="auth-footer">
                                    <p>{t('auth.restricted_access')}</p>
                                    <div className="access-prompt">
                                        {t('auth.already_account')} <NavLink to="/login">{t('auth.login_link')}</NavLink>
                                    </div>
                                </footer>
                            </>
                        )}
                    </div>

                    <div className="auth-security-footer">
                        <div className="sec-item"><ShieldCheck size={14} /> {t('auth.data_secured')}</div>
                        <div className="sec-item"><Building size={14} /> {t('auth.harmonized_path')}</div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Register;
