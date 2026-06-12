import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Package, 
  Settings, 
  LogOut, 
  ShieldCheck
} from 'lucide-react';
import './AccountLayout.css';

const AccountLayout = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('adminTwoFaVerified');
        window.dispatchEvent(new Event('authchange'));
        navigate('/', { replace: true });
    };

    return (
        <div className="account-layout modern-bg">
            <div className="container layout-grid">
                {}
                <aside className="account-sidebar">
                    <div className="sidebar-header">
                        <div className="user-avatar">
                            <User size={32} />
                        </div>
                        <div className="user-meta">
                            <h4>{t('account_layout.personal_workspace', 'Personal Workspace')}</h4>
                            <p>{t('account_layout.premium_access', 'Premium Institutional Access')}</p>
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                        <NavLink to="/account/settings" className={({isActive}) => isActive ? 'active' : ''}>
                            <Settings size={18} /> {t('account_layout.settings_link', 'Account Settings')}
                        </NavLink>
                        <NavLink to="/account/orders" className={({isActive}) => isActive ? 'active' : ''}>
                            <Package size={18} /> {t('account_layout.orders_link', 'My Orders')}
                        </NavLink>
                        <div className="sidebar-note">
                            <ShieldCheck size={18} />
                            <span>{t('account_layout.sidebar_note', 'Invoice, address, and security sections to be connected next.')}</span>
                        </div>
                        <button className="nav-logout" onClick={handleLogout}>
                            <LogOut size={18} /> {t('account_layout.logout', 'Sign Out')}
                        </button>
                    </nav>
                </aside>

                {}
                <main className="account-main-content">
                    <Outlet />
                </main>
            </div>

        </div>
    );
};

export default AccountLayout;
