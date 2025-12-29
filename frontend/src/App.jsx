import { useState } from 'react';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Chat from './components/Chat.jsx';
import Settings from './components/Settings.jsx';

function App() {
    const [token, setToken] = useState(null);
    const [view, setView] = useState('login'); // 'login', 'register', 'settings'

    const handleLogin = (userId) => {
        setToken(userId); // storing user_id as token for simplicity in this demo
        setView('chat'); // Reset view to chat on login
    };

    const handleLogout = () => {
        setToken(null);
        setView('login');
    };

    if (token) {
        if (view === 'settings') {
            return (
                <div className="App">
                    <Settings onBack={() => setView('chat')} />
                </div>
            );
        }
        return (
            <div className="App">
                <Chat onLogout={handleLogout} onOpenSettings={() => setView('settings')} />
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
