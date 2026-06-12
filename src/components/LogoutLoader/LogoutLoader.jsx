import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import './LogoutLoader.css';

const LogoutLoader = () => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [phaseText, setPhaseText] = useState('');

  useEffect(() => {
    
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

    </div>
  );
};

export default LogoutLoader;
