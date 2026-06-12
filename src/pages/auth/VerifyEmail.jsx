import { useEffect, useState } from 'react';
import { useSearchParams, NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { verifyEmail } from '../../services/api';
import './VerifyEmail.css';

const VerifyEmail = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); 
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage(t('auth.token_missing_verify', 'Verification token is missing from the link.'));
                return;
            }

            try {
                
                const res = await verifyEmail(token);
                const jwt = res.data?.token;

                if (jwt) {
                    localStorage.setItem('token', jwt);
                    
                    window.dispatchEvent(new Event('authchange'));
                }

                setStatus('success');
            } catch (err) {
                console.error('Email Verification Error:', err);
                setStatus('error');
                setMessage(err.response?.data?.error || t('auth.reset_failed', 'Verification failed. The link may have expired.'));
            }
        };
        verify();
    }, [token, t]);

    return (
        <div className="auth-page">
            <div className="auth-container u-single-col">
                <div className="auth-form-side">
                    <div className="form-card text-center">
                        <header className="auth-header">
                            <NavLink to="/" className="auth-logo">
                                <span className="sym">A</span>
                                <span className="txt">ALTHEA</span>
                            </NavLink>
                             <h2>{t('auth.verify_title')}</h2>
                        </header>

                        <div className="status-display">
                            {status === 'loading' && (
                                <div className="loading-state pulse">
                                    <Loader2 className="spinner" size={48} />
                                    <p>{t('auth.verifying_creds')}</p>
                                </div>
                            )}

                            {status === 'success' && (
                                <div className="success-state pulse">
                                    <ShieldCheck size={64} color="var(--primary)" />
                                    <h3>{t('auth.email_verified')}</h3>
                                    <p>
                                        {t('auth.verify_success')}
                                    </p>
                                    <div className="verify-actions">
                                        <button
                                            className="btn-auth-submit"
                                            onClick={() => navigate('/account/orders', { replace: true })}
                                        >
                                            <span>{t('auth.open_workspace')}</span>
                                            <ArrowRight size={20} />
                                        </button>
                                        <NavLink to="/catalogue" className="btn-outline-secondary">
                                            {t('product_page.breadcrumb_catalogue')}
                                        </NavLink>
                                    </div>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="error-state pulse">
                                    <XCircle size={64} color="#ef4444" />
                                    <h3>{t('auth.verify_failed')}</h3>
                                    <p>{message}</p>
                                    <NavLink
                                        to="/contact"
                                        className="btn-outline-primary"
                                        className="u-mt-2 u-inline-block"
                                    >
                                        {t('auth.contact_it')}
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default VerifyEmail;
