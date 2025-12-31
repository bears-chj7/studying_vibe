import { useState } from 'react';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Chat from './components/Chat.jsx';
import MainLayout from './components/MainLayout.jsx';
import UserInfo from './components/UserInfo.jsx';
import DocumentManager from './components/DocumentManager.jsx';
import UserManager from './components/UserManager.jsx';
import Settings from './components/Settings.jsx';

function App() {
    const [user, setUser] = useState(null); // replaces token, stores full user obj
    const [view, setView] = useState('login'); // 'login', 'register', 'settings', 'admin', 'chat'

    const handleLogin = (userData) => {
        setUser(userData);
        setView('chat');
    };

    const handleLogout = () => {
        setUser(null);
        setView('login');
    };

    if (user) {
        return (
            <MainLayout
                user={user}
                currentView={view}
                onViewChange={setView}
                onLogout={handleLogout}
            >
                {view === 'chat' && <Chat user={user} onOpenSettings={() => setView('settings')} />}
                {view === 'user-info' && <UserInfo user={user} />}
                {view === 'documents' && <DocumentManager user={user} />}
                {view === 'users' && <UserManager user={user} />}
                {view === 'settings' && <Settings onBack={() => setView('chat')} />}
                {/* Fallback or other views */}
            </MainLayout>
        );
    }

    return (
        <div className="App">
            <h1 className="landing-title">Heyonjoon's Vibo Coding Play Ground</h1>
            {view === 'login' ? (
                <Login onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />
            ) : (
                <Register onSwitchToLogin={() => setView('login')} />
            )}
        </div>
    );
}

export default App;
