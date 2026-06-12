import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Building, 
  Eye, 
  EyeOff,
  AlertCircle,
  LoaderCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { login } from '../../services/api';
import './Login.css';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        rememberMe: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await login(formData);
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                window.dispatchEvent(new Event('authchange'));
                navigate('/account/orders', { replace: true });
            } else if (res.data.requires2fa) {
                localStorage.setItem('adminChallengeId', res.data.challengeId);
                navigate(`/admin/2fa?challengeId=${res.data.challengeId}`, { replace: true });
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || t('auth.invalid_credentials'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {}
                <div className="auth-visual desktop-only">
                    <div className="visual-overlay">
                        <div className="visual-content">
                            <div className="visual-badge">{t('auth.secure_access')}</div>
                            <h1>{t('auth.connecting_excellence')}</h1>
                            <p>{t('auth.connecting_desc')}</p>
                            
                            <div className="visual-stats">
                                <div className="v-stat">
                                   <strong>2.5k+</strong>
                                   <span>{t('auth.hospitals_managed')}</span>
                                </div>
                                <div className="v-stat">
                                   <strong>99.9%</strong>
                                   <span>{t('auth.uptime')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {}
                <div className="auth-form-side">
                    <div className="form-card">
                        <header className="auth-header">
                            <NavLink to="/" className="auth-logo">
                                <span className="sym">A</span>
                                <span className="txt">ALTHEA</span>
                            </NavLink>
                            <h2>{t('auth.portal_title')}</h2>
                            <p>{t('auth.portal_desc')}</p>
                        </header>

                        {error && (
                            <div className="auth-error pulse">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="field-group">
                                <label>{t('auth.email_label')}</label>
                                <div className="input-icon-wrap">
                                    <Mail size={18} />
                                    <input 
                                        type="email" 
                                        name="username"
                                        placeholder="name@institution.com" 
                                        required
                                        disabled={loading}
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="field-group">
                                <div className="label-row">
                                    <label>{t('auth.key_label')}</label>
                                    <NavLink to="/forgot-password">{t('auth.trouble')}</NavLink>
                                </div>
                                <div className="input-icon-wrap">
                                    <Lock size={18} />
                                    <input 
                                        type={showPassword ? 'text' : 'password'} 
                                        name="password"
                                        placeholder="••••••••" 
                                        required
                                        disabled={loading}
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button 
                                        type="button" 
                                        className="eye-toggle"
                                        disabled={loading}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-options">
                                <label className="check-label">
                                    <input 
                                        type="checkbox" 
                                        name="rememberMe"
                                        disabled={loading}
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                    />
                                    <span>{t('auth.remember_me')}</span>
                                </label>
                            </div>

                            <button type="submit" className="btn-auth-submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <LoaderCircle size={20} className="spin-icon" />
                                        <span>{t('auth.signing_in')}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{t('auth.sign_in_btn')}</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        <footer className="auth-footer">
                            <p>{t('auth.restricted_notice')}</p>
                            <div className="access-prompt">
                                {t('auth.new_here')} <NavLink to="/register">{t('auth.apply_access')}</NavLink>
                            </div>
                        </footer>
                    </div>

                    <div className="auth-security-footer">
                        <div className="sec-item"><ShieldCheck size={14} /> {t('auth.aes_encryption')}</div>
                        <div className="sec-item"><Building size={14} /> {t('auth.iso_certified')}</div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Login;
