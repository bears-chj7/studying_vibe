import { useState } from 'react';

import { useTranslation } from 'react-i18next';

const Register = ({ onSwitchToLogin }) => {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, username, password, confirm_password: confirmPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Registration successful! Please login.');
                setTimeout(() => onSwitchToLogin(), 1500);
            } else {
                setError(data.error || 'Registration failed.');
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

                <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#8e8e8e', textAlign: 'center', margin: '0 40px 20px' }}>
                    {t('register.subtitle')}
                </h2>

                <button type="button" className="insta-btn" style={{ width: '100%', display: 'block' }}>
                    {t('login.btn_facebook')}
                </button>

                <div className="divider">
                    <div className="line"></div>
                    <div className="or">{t('login.or')}</div>
                    <div className="line"></div>
                </div>

                {message && <p style={{ color: 'green', textAlign: 'center', fontSize: '14px' }}>{message}</p>}
                {error && <p className="error-msg">{error}</p>}

                <form onSubmit={handleSubmit} className="insta-form">
                    <div className="input-field">
                        <input
                            type="text"
                            placeholder={t('register.placeholder_username')}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-field">
                        <input
                            type="text"
                            placeholder={t('register.placeholder_name')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-field">
                        <input
                            type="password"
                            placeholder={t('register.placeholder_password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-field">
                        <input
                            type="password"
                            placeholder={t('register.placeholder_confirm_password')}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <p style={{ fontSize: '12px', color: '#8e8e8e', textAlign: 'center', margin: '15px 0' }}>
                        {t('register.disclaimer_ai')}
                    </p>

                    <button type="submit" className="insta-btn" disabled={!username || !name || !password || !confirmPassword || isLoading}>
                        {isLoading ? t('register.btn_signup') + '...' : t('register.btn_signup')}
                    </button>
                </form>
            </div>

            <div className="insta-card signup-box">
                <p>
                    {t('register.have_account')} <button className="link-btn" onClick={onSwitchToLogin}>{t('register.login')}</button>
                </p>
            </div>
        </div>
    );
};

export default Register;
