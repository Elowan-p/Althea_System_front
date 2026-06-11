import { NavLink } from 'react-router-dom';
import { XCircle, ShoppingCart, HeadphonesIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Cancel.css';

const Cancel = () => {
    const { t } = useTranslation();

    return (
        <div className="cancel-page">
            <div className="cancel-card">
                <XCircle size={72} color="#ef4444" strokeWidth={1.5} />
                <h1>{t('cancel.title', 'Payment Cancelled')}</h1>
                <p>
                    {t('cancel.desc', 'Your payment was cancelled and no charges were made. Your cart items are still saved — you can resume your order whenever you\'re ready.')}
                </p>
                <div className="cancel-actions">
                    <NavLink to="/cart" className="btn-resume">
                        <ShoppingCart size={18} />
                        {t('cancel.return_cart', 'Return to Cart')}
                    </NavLink>
                    <NavLink to="/contact" className="btn-support">
                        <HeadphonesIcon size={18} />
                        {t('cancel.contact_support', 'Contact Support')}
                    </NavLink>
                </div>
                <div className="cancel-note">
                    {t('cancel.note', 'If you experienced an issue during payment, please contact our technical support team.')}
                </div>
            </div>
            
        </div>
    );
};

export default Cancel;
