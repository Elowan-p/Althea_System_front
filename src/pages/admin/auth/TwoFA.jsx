import { useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { ShieldCheck, KeyRound, AlertCircle, LoaderCircle, ArrowRight } from 'lucide-react';
import { verifyAdminTwoFA } from '../../../services/api';
import './TwoFA.css';

const TwoFA = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [challengeId, setChallengeId] = useState(
    searchParams.get('challengeId') || localStorage.getItem('adminChallengeId') || ''
  );
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!challengeId) return <Navigate to="/login" replace />;
  
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
      
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        if (res.data?.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
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

    </div>
  );
};

export default TwoFA;
