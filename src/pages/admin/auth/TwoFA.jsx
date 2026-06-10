import { useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { ShieldCheck, KeyRound, AlertCircle, LoaderCircle, ArrowRight } from 'lucide-react';
import { verifyAdminTwoFA } from '../../../services/api';

const TwoFA = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = localStorage.getItem('token');
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch { /* corrupted storage — treated as not admin */ }
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const [challengeId, setChallengeId] = useState(
    searchParams.get('challengeId') || localStorage.getItem('adminChallengeId') || ''
  );
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin account + JWT required before 2FA makes sense
  if (!token || !isAdmin) return <Navigate to="/login" replace />;
  // Already verified — straight to the backoffice
  if (localStorage.getItem('adminTwoFaVerified')) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!challengeId.trim()) {
      setError('Identifiant de challenge requis.');
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError('Le code doit contenir exactement 6 chiffres.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await verifyAdminTwoFA({ challengeId: challengeId.trim(), code });
      // The backend may rotate the JWT after a successful 2FA check
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        window.dispatchEvent(new Event('authchange'));
      }
      localStorage.setItem('adminTwoFaVerified', 'true');
      localStorage.removeItem('adminChallengeId');
      navigate('/admin', { replace: true });
    } catch (err) {
      console.error('2FA verification error:', err);
      setError(err.response?.data?.message || 'Code invalide ou expiré. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="twofa-page">
      <div className="twofa-card">
        <div className="twofa-icon"><ShieldCheck size={30} /></div>
        <h1>Vérification 2FA</h1>
        <p className="twofa-desc">
          L'accès au backoffice nécessite une double authentification.
          Saisissez le code à 6 chiffres qui vous a été transmis.
        </p>

        {error && (
          <div className="twofa-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="twofa-field">
            <label htmlFor="challengeId">Challenge ID</label>
            <input
              id="challengeId"
              type="text"
              value={challengeId}
              onChange={(e) => setChallengeId(e.target.value)}
              placeholder="Identifiant du challenge"
              disabled={loading}
              required
            />
          </div>

          <div className="twofa-field">
            <label htmlFor="code">Code à 6 chiffres</label>
            <input
              id="code"
              className="twofa-code-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="twofa-submit" disabled={loading || code.length !== 6}>
            {loading ? (
              <>
                <LoaderCircle size={20} className="twofa-spin" />
                <span>Vérification...</span>
              </>
            ) : (
              <>
                <KeyRound size={18} />
                <span>Valider l'accès</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        .twofa-page {
          min-height: calc(100vh - var(--header-height) - 200px);
          display: flex; align-items: center; justify-content: center;
          padding: 4rem 1.5rem;
        }
        .twofa-card {
          width: 100%; max-width: 440px; background: white;
          border: 1px solid var(--border); border-radius: 24px;
          padding: 3rem 2.5rem; text-align: center;
          box-shadow: 0 30px 60px -20px rgba(0,0,0,0.08);
        }
        .twofa-icon {
          width: 64px; height: 64px; margin: 0 auto 1.5rem;
          background: var(--primary); color: white;
          border-radius: 18px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 12px 24px -8px rgba(0, 92, 151, 0.5);
        }
        .twofa-card h1 { font-size: 1.6rem; font-weight: 900; color: #012a4a; margin-bottom: 0.75rem; }
        .twofa-desc { color: var(--text-muted); font-size: 0.92rem; margin-bottom: 2rem; }

        .twofa-error {
          display: flex; align-items: center; gap: 0.75rem; text-align: left;
          background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca;
          padding: 0.9rem 1rem; border-radius: 12px;
          font-size: 0.85rem; font-weight: 700; margin-bottom: 1.5rem;
        }

        .twofa-field { text-align: left; margin-bottom: 1.5rem; }
        .twofa-field label { display: block; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 0.6rem; }
        .twofa-field input {
          width: 100%; padding: 0.9rem 1rem; border-radius: 12px;
          border: 1.5px solid var(--border); background: white;
          font-weight: 600; font-size: 0.95rem; transition: var(--transition);
        }
        .twofa-field input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(0, 92, 151, 0.08); outline: none; }
        .twofa-code-input {
          text-align: center; font-size: 1.6rem !important; font-weight: 900 !important;
          letter-spacing: 0.6em; font-family: monospace;
        }

        .twofa-submit {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.8rem;
          background: var(--primary); color: white;
          padding: 1rem; border-radius: 14px; font-weight: 800; font-size: 0.95rem;
          transition: var(--transition);
        }
        .twofa-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0, 92, 151, 0.25); }
        .twofa-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .twofa-spin { animation: twofa-spin 0.8s linear infinite; }
        @keyframes twofa-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default TwoFA;
