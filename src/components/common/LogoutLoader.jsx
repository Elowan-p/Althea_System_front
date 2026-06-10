import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, ShieldCheck } from 'lucide-react';

const LogoutLoader = () => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [phaseText, setPhaseText] = useState('');

  useEffect(() => {
    // Phase texts based on progress
    const updatePhase = (prog) => {
      if (prog < 35) {
        setPhaseText(t('loader.logging_out', 'Déconnexion sécurisée de la session...'));
      } else if (prog < 70) {
        setPhaseText(t('auth.data_secured', 'Sécurisation des données locales...'));
      } else {
        setPhaseText(t('checkout_page.step_redirect', 'Redirection en cours...'));
      }
    };

    updatePhase(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 8) + 4;
        const bounded = Math.min(next, 100);
        updatePhase(bounded);
        return bounded;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [t]);

  return (
    <div className="logout-loader-overlay">
      <div className="logout-loader-container">
        <div className="logout-loader-circle-wrapper">
          <div className="logout-loader-ring"></div>
          <div className="logout-loader-icon-box">
            {progress < 100 ? (
              <RefreshCw className="logout-loader-icon spin-animation" size={32} />
            ) : (
              <ShieldCheck className="logout-loader-icon success-pulse" size={32} />
            )}
          </div>
        </div>

        <div className="logout-loader-info">
          <h3>ALTHEA SYSTEMS</h3>
          <p className="phase-message">{phaseText}</p>
        </div>

        <div className="logout-loader-progress-section">
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-percentage">{progress}%</span>
        </div>
      </div>

      <style>{`
        .logout-loader-overlay {
          position: fixed;
          inset: 0;
          background: rgba(248, 250, 252, 0.85);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.4s ease;
        }

        .logout-loader-container {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 28px;
          padding: 3rem 2.5rem;
          width: 90%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.05),
            0 20px 40px -15px rgba(1, 42, 74, 0.12),
            0 0 0 1px rgba(1, 42, 74, 0.02);
          text-align: center;
          animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .logout-loader-circle-wrapper {
          position: relative;
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .logout-loader-ring {
          position: absolute;
          inset: 0;
          border: 4px solid #f1f5f9;
          border-top: 4px solid var(--primary, #005c97);
          border-radius: 50%;
          animation: spin 1.5s cubic-bezier(0.53, 0.21, 0.29, 0.87) infinite;
        }

        .logout-loader-icon-box {
          z-index: 2;
          color: var(--primary, #005c97);
        }

        .spin-animation {
          animation: spin-icon 4s linear infinite;
        }

        .success-pulse {
          color: var(--success, #10b981);
          animation: pulseIcon 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .logout-loader-info h3 {
          font-size: 1.1rem;
          font-weight: 900;
          letter-spacing: 0.15em;
          color: #012a4a;
          margin-bottom: 0.5rem;
        }

        .phase-message {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-muted, #64748b);
          height: 24px;
          margin-bottom: 2rem;
          transition: all 0.3s ease;
        }

        .logout-loader-progress-section {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .progress-bar-container {
          flex: 1;
          height: 6px;
          background: #f1f5f9;
          border-radius: 99px;
          overflow: hidden;
          position: relative;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary, #005c97), var(--primary-light, #36d1dc));
          border-radius: 99px;
          transition: width 0.1s linear;
        }

        .progress-percentage {
          font-size: 0.85rem;
          font-weight: 900;
          color: var(--primary, #005c97);
          width: 36px;
          text-align: right;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes spin-icon {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes pulseIcon {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LogoutLoader;
