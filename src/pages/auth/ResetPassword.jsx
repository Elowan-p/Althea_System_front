import { useState } from 'react';
import { useSearchParams, useNavigate, NavLink } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { resetPassword } from '../../services/api';
import Loader from '../../components/common/Loader';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Access keys do not match.');
            return;
        }

        if (!token) {
            setError('Reset token is missing from URL.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            console.error("Reset Password Error:", err);
            setError(err.response?.data?.message || 'Failed to update access key. The link may have expired.');
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
                        <header className="auth-header text-center">
                            <NavLink to="/" className="auth-logo">
                                <span className="sym">A</span>
                                <span className="txt">ALTHEA</span>
                            </NavLink>
                            <h2>New Access Key</h2>
                            <p>Define a new security credential for your workstation</p>
                        </header>

                        {success ? (
                            <div className="success-view text-center pulse">
                                <ShieldCheck size={64} color="var(--primary)" />
                                <h3>Key Updated</h3>
                                <p>Your access key has been successfully reset. Redirecting to login...</p>
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
                                        <label>New Access Key</label>
                                        <div className="input-icon-wrap">
                                            <Lock size={18} />
                                            <input 
                                                type={showPassword ? 'text' : 'password'} 
                                                placeholder="••••••••" 
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button type="button" className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="field-group">
                                        <label>Confirm Access Key</label>
                                        <div className="input-icon-wrap">
                                            <Lock size={18} />
                                            <input 
                                                type={showPassword ? 'text' : 'password'} 
                                                placeholder="••••••••" 
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-auth-submit">
                                        <span>Update Credentials</span>
                                        <ArrowRight size={20} />
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                .text-center { text-align: center; }
                .success-view h3 { font-size: 1.8rem; font-weight: 850; margin-top: 1.5rem; color: #012a4a; }
                .success-view p { color: #64748b; margin-top: 1rem; }
            `}</style>
        </div>
    );
};

export default ResetPassword;
