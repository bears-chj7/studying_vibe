import React from 'react';
import './MainLayout.css';

import { useTranslation } from 'react-i18next';

const MainLayout = ({ user, currentView, onViewChange, onLogout, children }) => {
    const { t } = useTranslation();
    return (
        <div className="main-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>VIBE</h2>
                    <p className="user-greeting">{t('sidebar.greeting', { name: user?.username })}</p>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${currentView === 'chat' ? 'active' : ''}`}
                        onClick={() => onViewChange('chat')}
                    >
                        {t('sidebar.menu_chat')}
                    </button>
                    <button
                        className={`nav-item ${currentView === 'user-info' ? 'active' : ''}`}
                        onClick={() => onViewChange('user-info')}
                    >
                        {t('sidebar.menu_user_info')}
                    </button>
                    {/* Document Manager Checks: access_page contains 'documents' */}
                    {/* Document Manager Checks: access_page contains 'documents' or 'document' */}
                    {(user?.attributes?.['access_page']?.includes('documents') || user?.attributes?.['access_page']?.includes('document')) && (
                        <button
                            className={`nav-item ${currentView === 'documents' ? 'active' : ''}`}
                            onClick={() => onViewChange('documents')}
                        >
                            {t('sidebar.menu_documents')}
                        </button>
                    )}

                    {/* Account Manager Checks: access_page contains 'users' */}
                    {user?.attributes?.['access_page']?.includes('users') && (
                        <button
                            className={`nav-item ${currentView === 'users' ? 'active' : ''}`}
                            onClick={() => onViewChange('users')}
                        >
                            {t('sidebar.menu_users')}
                        </button>
                    )}

                    <button
                        className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
                        onClick={() => onViewChange('settings')}
                    >
                        {t('sidebar.menu_settings')}
                    </button>

                    <button
                        className={`nav-item ${currentView === 'legal' ? 'active' : ''}`}
                        onClick={() => onViewChange('legal')}
                    >
                        {t('sidebar.menu_legal')}
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={onLogout}>
                        {t('sidebar.btn_logout')}
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
