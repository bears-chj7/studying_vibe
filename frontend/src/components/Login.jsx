import { useState } from 'react';

import { useTranslation } from 'react-i18next';

const Login = ({ onLogin, onSwitchToRegister }) => {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Pass the user details returned from backend
                onLogin({ name: data.name, username: username, attributes: data.attributes });
            } else {
                setError(data.error || t('login.failed', 'Login failed.'));
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

                <form onSubmit={handleSubmit} className="insta-form">
                    <div className="input-field">
                        <input
                            type="text"
                            placeholder={t('login.placeholder_username')}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-field">
                        <input
                            type="password"
                            placeholder={t('login.placeholder_password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="insta-btn" disabled={!username || !password || isLoading}>
                        {isLoading ? t('login.btn_logging_in') : t('login.btn_login')}
                    </button>

                    {error && <p className="error-msg">{error}</p>}

                    <div className="divider">
                        <div className="line"></div>
                        <div className="or">{t('login.or')}</div>
                        <div className="line"></div>
                    </div>

                    <button type="button" className="fb-login">
                        {t('login.btn_facebook')}
                    </button>
                    <a href="#" className="forgot-password">{t('login.forgot_password')}</a>
                </form>
            </div>

            <div className="insta-card signup-box">
                <p>
                    {t('login.no_account')} <button className="link-btn" onClick={onSwitchToRegister}>{t('login.signup')}</button>
                </p>
            </div>
        </div>
    );
};

export default Login;
