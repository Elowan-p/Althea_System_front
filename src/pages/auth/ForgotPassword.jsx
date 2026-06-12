import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Mail, 
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { forgotPassword } from '../../services/api';
import Loader from '../../components/Loader/Loader';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            console.error("Forgot Password Error:", err);
            setError(err.response?.data?.message || t('auth.reset_failed'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="auth-page">
            <div className="auth-container u-single-col">
                <div className="auth-form-side">
                    <div className="form-card">
                        <header className="auth-header">
                            <NavLink to="/" className="auth-logo">
                                <span className="sym">A</span>
                                <span className="txt">ALTHEA</span>
                            </NavLink>
                            <h2>{t('auth.reset_access_key')}</h2>
                            <p>{t('auth.secure_instructions')}</p>
                        </header>
 
                        {success ? (
                            <div className="success-view text-center pulse">
                                <div className="success-icon-wrap u-mb-15">
                                    <ShieldCheck size={48} color="var(--primary)" />
                                </div>
                                <h3 className="fp-sent-title">{t('auth.dispatching')}</h3>
                                <p className="fp-sent-text" dangerouslySetInnerHTML={{ __html: t('auth.recovery_sent', { email }) }}></p>
                                <NavLink to="/login" className="back-link u-justify-center">
                                    <ArrowLeft size={16} /> {t('auth.return_signin')}
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
                                    <div className="field-group">
                                        <label>{t('auth.registered_email')}</label>
                                        <div className="input-icon-wrap">
                                            <Mail size={18} />
                                            <input 
                                                type="email" 
                                                placeholder="name@institution.com" 
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>
 
                                    <button type="submit" className="btn-auth-submit">
                                        <span>{t('auth.send_link')}</span>
                                        <ArrowRight size={20} />
                                    </button>
                                </form>
 
                                <footer className="auth-footer">
                                    <NavLink to="/login" className="back-link u-justify-center">
                                        <ArrowLeft size={16} /> {t('auth.back_login')}
                                    </NavLink>
                                </footer>
                            </>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default ForgotPassword;
