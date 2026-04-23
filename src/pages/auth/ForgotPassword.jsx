import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Mail, 
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { forgotPassword } from '../../services/api';
import Loader from '../../components/common/Loader';

const ForgotPassword = () => {
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
            setError(err.response?.data?.message || 'Verification failed. Please check your email address.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="auth-page">
            <div className="auth-container" style={{ gridTemplateColumns: '1fr' }}>
                <div className="auth-form-side">
                    <div className="form-card">
                        <header className="auth-header">
                            <NavLink to="/" className="auth-logo">
                                <span className="sym">A</span>
                                <span className="txt">ALTHEA</span>
                            </NavLink>
                            <h2>Reset Access Key</h2>
                            <p>We'll send secure instructions to your business email</p>
                        </header>

                        {success ? (
                            <div className="success-view text-center pulse">
                                <div className="success-icon-wrap" style={{ marginBottom: '1.5rem' }}>
                                    <ShieldCheck size={48} color="var(--primary)" />
                                </div>
                                <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Dispatching Instructions</h3>
                                <p style={{ color: '#64748b', marginBottom: '2rem' }}>A secure recovery link has been sent to <strong>{email}</strong>. Please follow the instructions to regain access.</p>
                                <NavLink to="/login" className="back-link" style={{ justifyContent: 'center' }}>
                                    <ArrowLeft size={16} /> Return to Sign In
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
                                        <label>Registered Email</label>
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
                                        <span>Send Recovery Link</span>
                                        <ArrowRight size={20} />
                                    </button>
                                </form>

                                <footer className="auth-footer">
                                    <NavLink to="/login" className="back-link" style={{ justifyContent: 'center' }}>
                                        <ArrowLeft size={16} /> Back to Login
                                    </NavLink>
                                </footer>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                .text-center { text-align: center; }
                .success-view h3 { color: #012a4a; }
                .back-link { display: flex; align-items: center; gap: 0.5rem; color: var(--primary); font-weight: 700; text-decoration: none; }
            `}</style>
        </div>
    );
};

export default ForgotPassword;
