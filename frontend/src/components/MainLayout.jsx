import React from 'react';
import './MainLayout.css';

const MainLayout = ({ user, currentView, onViewChange, onLogout, children }) => {
    return (
        <div className="main-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>VIBE</h2>
                    <p className="user-greeting">Hello, {user?.username}</p>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${currentView === 'chat' ? 'active' : ''}`}
                        onClick={() => onViewChange('chat')}
                    >
                        Chat
                    </button>
                    <button
                        className={`nav-item ${currentView === 'user-info' ? 'active' : ''}`}
                        onClick={() => onViewChange('user-info')}
                    >
                        User Info
                    </button>
                    {/* Document Manager Checks: access_page contains 'documents' */}
                    {/* Document Manager Checks: access_page contains 'documents' or 'document' */}
                    {(user?.attributes?.['access_page']?.includes('documents') || user?.attributes?.['access_page']?.includes('document')) && (
                        <button
                            className={`nav-item ${currentView === 'documents' ? 'active' : ''}`}
                            onClick={() => onViewChange('documents')}
                        >
                            Documents
                        </button>
                    )}

                    {/* Account Manager Checks: access_page contains 'users' */}
                    {user?.attributes?.['access_page']?.includes('users') && (
                        <button
                            className={`nav-item ${currentView === 'users' ? 'active' : ''}`}
                            onClick={() => onViewChange('users')}
                        >
                            Users
                        </button>
                    )}

                    <button
                        className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
                        onClick={() => onViewChange('settings')}
                    >
                        Settings
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={onLogout}>
                        Logout
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
