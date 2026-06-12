import { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { ShieldCheck, CreditCard, Loader2, Lock, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { checkoutCart } from '../../services/api';
import './Checkout.css';

const steps = [
    { labelKey: 'checkout_page.step_authorize', defaultLabel: 'Authorizing Secure Connection', delay: 0 },
    { labelKey: 'checkout_page.step_allocate', defaultLabel: 'Allocating Inventory', delay: 1200 },
    { labelKey: 'checkout_page.step_generate', defaultLabel: 'Generating Payment Session', delay: 2400 },
    { labelKey: 'checkout_page.step_redirect', defaultLabel: 'Redirecting to Payment Gateway', delay: 3600 },
];

const Checkout = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState('');
    const isAuthenticated = !!localStorage.getItem('token');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
            return;
        }

        let stepTimers = [];

        const initiateCheckout = async () => {
            
            steps.forEach((step, i) => {
                const t = setTimeout(() => setCurrentStep(i), step.delay);
                stepTimers.push(t);
            });

            try {
                const res = await checkoutCart();
                const stripeUrl = res.data?.url;
                if (!stripeUrl) throw new Error('No checkout URL returned from server.');

                
                setTimeout(() => {
                    window.location.href = stripeUrl;
                }, 4200);
            } catch (err) {
                stepTimers.forEach(clearTimeout);
                console.error('Checkout error:', err);
                const msg =
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    t('checkout_page.failed_desc', 'Unable to initiate checkout. Your cart may be empty.');
                setError(msg);
            }
        };

        initiateCheckout();
        return () => stepTimers.forEach(clearTimeout);
    }, [isAuthenticated, navigate, t]);

    if (error) {
        return (
            <div className="checkout-page">
                <div className="checkout-card">
                    <AlertCircle size={56} color="#ef4444" />
                    <h2>{t('checkout_page.failed', 'Checkout Failed')}</h2>
                    <p className="err-msg">{error}</p>
                    <div className="checkout-error-actions">
                        <button className="btn-back" onClick={() => navigate('/cart')}>
                            ← {t('checkout_page.return_cart', 'Return to Cart')}
                        </button>
                        <NavLink to="/contact" className="btn-support">{t('checkout_page.contact_support', 'Contact Support')}</NavLink>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-card">
                <div className="checkout-logo-wrap">
                    <div className="checkout-logo">A</div>
                </div>
                <div className="checkout-lock">
                    <Lock size={18} /> {t('checkout_page.secure_checkout', 'Secure Institutional Checkout')}
                </div>
                <h2>{t('checkout_page.preparing', 'Preparing Your Order')}</h2>
                <p className="checkout-sub">
                    {t('checkout_page.wait_session', 'Please wait while we establish a secure payment session.')}
                </p>

                <div className="steps-list">
                    {steps.map((step, i) => (
                        <div key={i} className={`step-row ${i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending'}`}>
                            <div className="step-indicator">
                                {i < currentStep
                                    ? <ShieldCheck size={16} />
                                    : i === currentStep
                                        ? <Loader2 size={16} className="spin-icon" />
                                        : <span className="dot" />
                                }
                            </div>
                            <span>{t(step.labelKey, step.defaultLabel)}</span>
                        </div>
                    ))}
                </div>

                <div className="checkout-trust">
                    <CreditCard size={14} /> {t('checkout_page.powered_stripe', 'Powered by Stripe • 256-bit AES Encryption')}
                </div>
            </div>
        </div>
    );
};

export default Checkout;
