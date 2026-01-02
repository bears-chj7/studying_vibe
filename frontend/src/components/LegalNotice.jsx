import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LegalNotice = () => {
    const { t } = useTranslation();

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
                fontSize: '1.5rem',
                marginBottom: '1.5rem',
                color: '#262626',
                fontWeight: '300'
            }}>{t('legal.title')}</h2>

            <div className="insta-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'stretch' }}>

                {/* Security Section */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>{t('legal.security_title')}</h3>
                    <p style={{ lineHeight: '1.6', color: '#262626' }}>{t('legal.security_content')}</p>
                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', color: '#666' }}>
                        <li>{t('legal.security_point_1')}</li>
                        <li>{t('legal.security_point_2')}</li>
                    </ul>
                </div>

                {/* Storage Section */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>{t('legal.storage_title')}</h3>
                    <p style={{ lineHeight: '1.6', color: '#262626' }}>{t('legal.storage_content')}</p>
                </div>

                {/* Chat Privacy Section */}
                <div style={{ padding: '1rem', backgroundColor: '#f0f8ff', borderRadius: '8px', border: '1px solid #d0efff' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600', color: '#0073b1' }}>{t('legal.chat_privacy_title')}</h3>
                    <p style={{ lineHeight: '1.6', color: '#262626' }}>{t('legal.chat_storage')}</p>
                </div>

            </div>
        </div>
    );
};

export default LegalNotice;
