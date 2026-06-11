import React from 'react';
import { useTranslation } from 'react-i18next';
import './Loader.css';

const Loader = () => {
    const { t } = useTranslation();
    return (
        <div className="loader-overlay">
            <div className="loader-container">
                <div className="loader-logo">A</div>
                <div className="loader-spinner"></div>
                <div className="loader-text">ALTHEA SYSTEMS</div>
                <div className="loader-tag">{t('loader.initializing', 'Initializing Premium Infrastructure...')}</div>
            </div>

        </div>
    );
};

export default Loader;
