import { useState } from 'react';
import { User, Mail, Phone, Building, Save, ShieldCheck, BellRing } from 'lucide-react';

const Settings = () => {
    const [user, setUser] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@clinic-network.com',
        phone: '+1 (555) 0123-4567',
        company: 'Global Medical Corp',
        role: 'Procurement Specialist'
    });

    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleChange = (e) => {
        setUser({...user, [e.target.name]: e.target.value});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 800);
    };

    return (
        <div className="settings-page">
            <header className="page-header">
                <h1 className="page-title">Profile Settings</h1>
                <p className="page-subtitle">Manage your personal information and institutional preferences.</p>
            </header>

            <form onSubmit={handleSubmit} className="settings-grid">
                <section className="settings-section">
                    <h3 className="section-title"><User size={18} /> Basic Information</h3>
                    <div className="form-row">
                        <div className="input-group">
                            <label>First Name</label>
                            <input type="text" name="firstName" value={user.firstName} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Last Name</label>
                            <input type="text" name="lastName" value={user.lastName} onChange={handleChange} />
                        </div>
                    </div>
                </section>

                <section className="settings-section">
                    <h3 className="section-title"><Mail size={18} /> Professional Contact</h3>
                    <div className="form-row">
                        <div className="input-group">
                            <label>Institutional Email</label>
                            <input type="email" name="email" value={user.email} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Direct Phone</label>
                            <input type="text" name="phone" value={user.phone} onChange={handleChange} />
                        </div>
                    </div>
                </section>

                <section className="settings-section">
                    <h3 className="section-title"><Building size={18} /> Organization</h3>
                    <div className="input-group">
                        <label>Company / Hospital</label>
                        <input type="text" name="company" value={user.company} onChange={handleChange} />
                    </div>
                </section>

                <div className="form-actions">
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? 'Updating...' : <><Save size={18} /> Save Workspace Changes</>}
                    </button>
                    {saved && <span className="save-success">✓ Changes persisted successfully</span>}
                </div>
            </form>

            <div className="extra-options-grid mt-4">
                <div className="option-card">
                    <ShieldCheck size={24} className="text-primary" />
                    <div>
                        <h4>Security & 2FA</h4>
                        <p>Protect your medical procurement access with Two-Factor Authentication.</p>
                    </div>
                </div>
                <div className="option-card">
                    <BellRing size={24} className="text-primary" />
                    <div>
                        <h4>Notifications</h4>
                        <p>Configure alerts for order status, maintenance cycles, and compliance updates.</p>
                    </div>
                </div>
            </div>

            <style>{`
                .page-header { margin-bottom: 4rem; padding-bottom: 2rem; border-bottom: 2px solid #f8fafc; }
                .page-title { font-size: 2.2rem; font-weight: 900; color: #012a4a; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
                .page-subtitle { color: #64748b; font-size: 1rem; font-weight: 500; }

                .settings-grid { display: flex; flex-direction: column; gap: 3rem; }
                .settings-section { padding: 2rem; background: #fcfdfe; border: 1px solid #f1f5f9; border-radius: 20px; }
                .section-title { display: flex; align-items: center; gap: 0.8rem; font-size: 1.1rem; font-weight: 800; color: var(--primary); margin-bottom: 2rem; }
                
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .input-group label { font-size: 0.75rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem; }
                .input-group input { padding: 1rem 1.25rem; border-radius: 12px; border: 1.5px solid #e2e8f0; font-weight: 700; color: #012a4a; background: white; transition: all 0.3s ease; }
                .input-group input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(1, 42, 74, 0.05); outline: none; }

                .form-actions { display: flex; align-items: center; gap: 2rem; margin-top: 1rem; }
                .btn-save { display: flex; align-items: center; gap: 0.8rem; background: var(--primary); color: white; padding: 1.25rem 2.5rem; border-radius: 16px; font-weight: 800; font-size: 1rem; box-shadow: 0 10px 20px rgba(1, 42, 74, 0.1); transition: all 0.3s ease; }
                .btn-save:hover { transform: translateY(-3px); box-shadow: 0 20px 30px rgba(1, 42, 74, 0.2); }
                .save-success { color: #10b981; font-weight: 800; font-size: 0.9rem; }

                .extra-options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 4rem; }
                .option-card { display: flex; gap: 1.5rem; padding: 2rem; background: white; border: 1px solid #f1f5f9; border-radius: 20px; transition: all 0.3s ease; cursor: pointer; }
                .option-card:hover { transform: translateY(-4px); box-shadow: 0 15px 35px -10px rgba(0,0,0,0.08); border-color: var(--primary); }
                .option-card h4 { font-size: 1.1rem; font-weight: 800; color: #012a4a; margin-bottom: 0.4rem; }
                .option-card p { font-size: 0.9rem; color: #64748b; line-height: 1.5; }

                .mt-4 { margin-top: 4rem; }
                .text-primary { color: var(--primary); }

                @media (max-width: 768px) {
                    .form-row, .extra-options-grid { grid-template-columns: 1fr; }
                    .page-title { font-size: 1.8rem; }
                }
            `}</style>
        </div>
    );
};

export default Settings;
