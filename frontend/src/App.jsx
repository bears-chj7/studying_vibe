import { useState } from 'react';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Chat from './components/Chat.jsx';
import Settings from './components/Settings.jsx';
import Admin from './components/Admin.jsx';

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
        if (view === 'settings') {
            return (
                <div className="App">
                    <Settings onBack={() => setView('chat')} />
                </div>
            );
        }
        if (view === 'admin') {
            return (
                <div className="App">
                    <Admin user={user} onBack={() => setView('chat')} />
                </div>
            );
        }
        return (
            <div className="App">
                <Chat
                    onLogout={handleLogout}
                    onOpenSettings={() => setView('settings')}
                    user={user}
                />
                {user.role === 'admin' && (
                    <button
                        onClick={() => setView('admin')}
                        style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, padding: '10px', background: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        Admin Panel
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="App">
            <h1>Heyonjoon's<br /> Vibo Coding Play Ground</h1>
            {view === 'login' ? (
                <Login onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />
            ) : (
                <Register onSwitchToLogin={() => setView('login')} />
            )}
        </div>
    );
}

export default App;
