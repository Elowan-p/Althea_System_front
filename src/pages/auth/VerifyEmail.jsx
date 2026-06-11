import { useEffect, useState } from 'react';
import { useSearchParams, NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { verifyEmail } from '../../services/api';

const VerifyEmail = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading | success | error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage(t('auth.token_missing_verify', 'Verification token is missing from the link.'));
                return;
            }

            try {
                // Backend returns { message, token } — store JWT and log user in immediately
                const res = await verifyEmail(token);
                const jwt = res.data?.token;

                if (jwt) {
                    localStorage.setItem('token', jwt);
                    // Notify all components (Header cart count, auth state, etc.)
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
            <div className="auth-container" style={{ gridTemplateColumns: '1fr' }}>
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
                                        style={{ marginTop: '2rem', display: 'inline-block' }}
                                    >
                                        {t('auth.contact_it')}
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .auth-page {
                    max-width: 100vw;
                    min-height: calc(100vh - var(--header-height, 80px));
                    background: linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 50%, #f0f7ff 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 1rem;
                }
                .auth-container {
                    width: 100%;
                    max-width: 480px;
                    background: white;
                    border-radius: 28px;
                    box-shadow: 0 40px 80px -20px rgba(0, 92, 151, 0.15);
                    border: 1px solid #bfdbfe;
                    overflow: hidden;
                }
                .auth-form-side {
                    padding: 3.5rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    background: white;
                }
                .form-card { width: 100%; }
                .auth-header { text-align: center; margin-bottom: 2.5rem; }
                .auth-logo { display: inline-flex; align-items: center; gap: 0.6rem; margin-bottom: 1.5rem; text-decoration: none; }
                .auth-logo .sym { background: var(--primary); color: white; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; font-weight: 900; font-size: 1.4rem; }
                .auth-logo .txt { font-size: 1.6rem; font-weight: 900; color: #012a4a; letter-spacing: -0.05em; }
                .auth-header h2 { font-size: 1.8rem; font-weight: 850; color: #012a4a; }
                .btn-auth-submit { width: 100%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1.1rem; border-radius: 14px; font-weight: 800; font-size: 1rem; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .btn-auth-submit:hover { transform: translateY(-4px); box-shadow: 0 15px 30px rgba(0, 92, 151, 0.25); }
                .pulse { animation: p 0.4s ease; }
                @keyframes p { 0% { transform: scale(0.98); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
                .text-center { text-align: center; }
                .spinner { animation: spin 2s linear infinite; margin: 0 auto 1.5rem; color: var(--primary); }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .status-display p { color: #64748b; margin-top: 1rem; line-height: 1.7; max-width: 380px; margin-left: auto; margin-right: auto; }
                .success-state h3, .error-state h3 { font-size: 1.8rem; font-weight: 850; margin-top: 1.5rem; color: #012a4a; }
                .verify-actions { display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem; align-items: center; }
                .btn-outline-primary { border: 2px solid var(--primary); color: var(--primary); padding: 0.8rem 2rem; border-radius: 12px; font-weight: 800; text-decoration: none; }
                .btn-outline-secondary { color: #64748b; font-weight: 700; font-size: 0.9rem; text-decoration: underline; }

                @media (max-width: 600px) {
                    .auth-page { padding: 1.5rem 0.5rem; }
                    .auth-form-side { padding: 2rem 1.5rem; }
                    .success-state h3, .error-state h3 { font-size: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default VerifyEmail;
