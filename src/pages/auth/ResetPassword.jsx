import { useState } from 'react';
import { useSearchParams, useNavigate, NavLink } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resetPassword } from '../../services/api';
import Loader from '../../components/Loader/Loader';
import './ResetPassword.css';

const ResetPassword = () => {
    const { t } = useTranslation();
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
            setError(t('auth.keys_mismatch', 'Access keys do not match.'));
            return;
        }

        if (!token) {
            setError(t('auth.token_missing', 'Reset token is missing from URL. Please use the link from your email.'));
            return;
        }

        setLoading(true);
        setError('');

        try {
            
            await resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            console.error('Reset Password Error:', err);
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                t('auth.reset_failed', 'Failed to update access key. The link may have expired.')
            );
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
                        <header className="auth-header text-center">
                            <NavLink to="/" className="auth-logo">
                                <span className="sym">A</span>
                                <span className="txt">ALTHEA</span>
                            </NavLink>
                            <h2>{t('auth.new_access_key')}</h2>
                            <p>{t('auth.define_credential')}</p>
                        </header>

                        {success ? (
                            <div className="success-view text-center pulse">
                                <ShieldCheck size={64} color="var(--primary)" />
                                <h3>{t('auth.key_updated')}</h3>
                                <p>{t('auth.reset_success')}</p>
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
                                        <label>{t('auth.new_access_key')}</label>
                                        <div className="input-icon-wrap">
                                            <Lock size={18} />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                required
                                                minLength={8}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="eye-toggle"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="field-group">
                                        <label>{t('auth.confirm_key')}</label>
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
                                        <span>{t('auth.update_credentials')}</span>
                                        <ArrowRight size={20} />
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default ResetPassword;
