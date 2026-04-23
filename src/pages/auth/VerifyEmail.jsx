import { useEffect, useState } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import { ShieldCheck, XCircle, Loader2 } from 'lucide-react';
import { verifyEmail } from '../../services/api';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Verification token is missing.');
                return;
            }

            try {
                await verifyEmail(token);
                setStatus('success');
            } catch (err) {
                console.error("Email Verification Error:", err);
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
            }
        };
        verify();
    }, [token]);

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
                            <h2>Security Verification</h2>
                        </header>

                        <div className="status-display">
                            {status === 'loading' && (
                                <div className="loading-state pulse">
                                    <Loader2 className="spinner" size={48} />
                                    <p>Verifying your institutional credentials...</p>
                                </div>
                            )}

                            {status === 'success' && (
                                <div className="success-state pulse">
                                    <ShieldCheck size={64} color="var(--primary)" />
                                    <h3>Email Verified</h3>
                                    <p>Your account has been successfully verified. You can now access the professional workspace.</p>
                                    <NavLink to="/login" className="btn-auth-submit" style={{ marginTop: '2rem' }}>
                                        Sign In to Workspace
                                    </NavLink>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="error-state pulse">
                                    <XCircle size={64} color="#ef4444" />
                                    <h3>Verification Failed</h3>
                                    <p>{message}</p>
                                    <NavLink to="/contact" className="btn-outline-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
                                        Contact IT Support
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .text-center { text-align: center; }
                .spinner { animation: spin 2s linear infinite; margin: 0 auto 1.5rem; color: var(--primary); }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .status-display p { color: #64748b; margin-top: 1rem; }
                .success-state h3, .error-state h3 { font-size: 1.8rem; font-weight: 850; margin-top: 1.5rem; color: #012a4a; }
                .btn-outline-primary { border: 2px solid var(--primary); color: var(--primary); padding: 0.8rem 2rem; border-radius: 12px; font-weight: 800; text-decoration: none; }
            `}</style>
        </div>
    );
};

export default VerifyEmail;
