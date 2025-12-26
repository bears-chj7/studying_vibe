import { useState } from 'react';

const Login = ({ onLogin, onSwitchToRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Pass the real name returned from backend
                onLogin(data.name);
            } else {
                setError(data.error || 'Login failed.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="insta-card">
                <h1 className="insta-logo">Instagram</h1>
                <form onSubmit={handleSubmit} className="insta-form">
                    <div className="input-field">
                        <input
                            type="text"
                            placeholder="Phone number, username, or email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-field">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="insta-btn" disabled={!username || !password || isLoading}>
                        {isLoading ? 'Logging in...' : 'Log in'}
                    </button>

                    {error && <p className="error-msg">{error}</p>}

                    <div className="divider">
                        <div className="line"></div>
                        <div className="or">OR</div>
                        <div className="line"></div>
                    </div>

                    <button type="button" className="fb-login">
                        Log in with Facebook
                    </button>
                    <a href="#" className="forgot-password">Forgot password?</a>
                </form>
            </div>

            <div className="insta-card signup-box">
                <p>
                    Don't have an account? <button className="link-btn" onClick={onSwitchToRegister}>Sign up</button>
                </p>
            </div>
        </div>
    );
};

export default Login;
