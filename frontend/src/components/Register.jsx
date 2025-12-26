import { useState } from 'react';

const Register = ({ onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
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
                <h1 className="insta-logo">Instagram</h1>
                <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#8e8e8e', textAlign: 'center', margin: '0 40px 20px' }}>
                    Sign up to see photos and videos from your friends.
                </h2>

                <button type="button" className="insta-btn" style={{ width: '100%', display: 'block' }}>
                    Log in with Facebook
                </button>

                <div className="divider">
                    <div className="line"></div>
                    <div className="or">OR</div>
                    <div className="line"></div>
                </div>

                {message && <p style={{ color: 'green', textAlign: 'center', fontSize: '14px' }}>{message}</p>}
                {error && <p className="error-msg">{error}</p>}

                <form onSubmit={handleSubmit} className="insta-form">
                    <div className="input-field">
                        <input
                            type="email"
                            placeholder="Mobile Number or Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-field">
                        <input
                            type="text"
                            placeholder="Full Name"
                        />
                    </div>
                    <div className="input-field">
                        <input
                            type="text"
                            placeholder="Username"
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

                    <p style={{ fontSize: '12px', color: '#8e8e8e', textAlign: 'center', margin: '15px 0' }}>
                        People who use our service may have uploaded your contact information to Instagram. <a href="#" style={{ fontWeight: '600', color: '#8e8e8e', textDecoration: 'none' }}>Learn More</a>
                    </p>

                    <button type="submit" className="insta-btn" disabled={!email || !password || isLoading}>
                        {isLoading ? 'Signing up...' : 'Sign up'}
                    </button>
                </form>
            </div>

            <div className="insta-card signup-box">
                <p>
                    Have an account? <button className="link-btn" onClick={onSwitchToLogin}>Log in</button>
                </p>
            </div>
        </div>
    );
};

export default Register;
