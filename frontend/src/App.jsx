import { useState } from 'react';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';

function App() {
    const [token, setToken] = useState(null);
    const [view, setView] = useState('login'); // 'login' or 'register'

    const handleLogin = (userId) => {
        setToken(userId); // storing user_id as token for simplicity in this demo
    };

    const handleLogout = () => {
        setToken(null);
        setView('login');
    };

    if (token) {
        return (
            <div className="App">
                <h1>Welcome, User {token}!</h1>
                <button onClick={handleLogout}>Logout</button>
            </div>
        );
    }

    return (
        <div className="App">
            <h1>React + Flask MariaDB Auth</h1>
            {view === 'login' ? (
                <Login onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />
            ) : (
                <Register onSwitchToLogin={() => setView('login')} />
            )}
        </div>
    );
}

export default App;
