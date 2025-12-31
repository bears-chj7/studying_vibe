import { useState, useEffect } from 'react';

const Settings = ({ onBack }) => {
    const [selectedModel, setSelectedModel] = useState('ollama');

    useEffect(() => {
        const storedModel = localStorage.getItem('chatModel');
        if (storedModel) {
            setSelectedModel(storedModel);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('chatModel', selectedModel);
        onBack();
    };

    return (
        <div style={styles.container}>
            <div className="insta-card">
                <h2 style={styles.title}>Settings</h2>

                <div style={styles.field}>
                    <label style={styles.label}>Select AI Model</label>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        style={styles.select}
                    >
                        <option value="ollama">Ollama (Llama 3.2:1b)</option>
                        <option value="gemini">Gemini API</option>
                    </select>
                </div>

                <div style={styles.buttons}>
                    <button onClick={onBack} className="insta-btn" style={{ background: 'transparent', color: '#262626', border: '1px solid #dbdbdb' }}>Cancel</button>
                    <button onClick={handleSave} className="insta-btn" style={{ marginLeft: '10px' }}>Save</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: '400px',
    },
    card: {
        backgroundColor: 'white',
        border: '1px solid #dbdbdb',
        borderRadius: '3px',
        padding: '30px',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#262626',
    },
    field: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '10px',
        fontWeight: '600',
        color: '#262626',
    },
    select: {
        width: '100%',
        padding: '10px',
        border: '1px solid #dbdbdb',
        borderRadius: '3px',
        backgroundColor: '#fafafa',
        fontSize: '14px',
    },
    buttons: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '10px',
    },
    cancelBtn: {
        padding: '8px 15px',
        border: '1px solid #dbdbdb',
        background: 'none',
        borderRadius: '3px',
        cursor: 'pointer',
    },
    saveBtn: {
        padding: '8px 15px',
        backgroundColor: '#0095f6',
        color: 'white',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer',
        fontWeight: '600',
    }
};

export default Settings;
