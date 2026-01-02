import { useState } from 'react';

const Admin = ({ user, onBack }) => {
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleIngest = async () => {
        setIsLoading(true);
        setStatus('Starting ingestion...');
        try {
            const response = await fetch('/api/admin/ingest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: user.username }),
            });

            const data = await response.json();
            if (response.ok) {
                setStatus(`Success: ${data.message} Status: ${data.status}`);
            } else {
                setStatus(`Error: ${data.error}`);
            }
        } catch (e) {
            setStatus(`Connection Error: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', color: 'white' }}>
            <h2>Admin Dashboard</h2>
            <p>Welcome, {user.name} ({user.role})</p>
            <button onClick={onBack} className="insta-btn" style={{ width: 'auto', marginBottom: '20px' }}>Back to Chat</button>

            <div className="insta-card">
                <h3>RAG Management</h3>
                <p>Ingest PDFs from the server directory into the Vector DB.</p>
                <button
                    onClick={handleIngest}
                    className="insta-btn"
                    disabled={isLoading}
                >
                    {isLoading ? 'Ingesting...' : 'Ingest PDFs'}
                </button>
                {status && (
                    <div style={{ marginTop: '20px', padding: '10px', background: '#333', borderRadius: '5px' }}>
                        <strong>Status:</strong> {status}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
