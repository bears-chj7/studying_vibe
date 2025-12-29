import { useState, useEffect } from 'react';

const Chat = ({ onLogout, onOpenSettings }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentModel, setCurrentModel] = useState('ollama');

    useEffect(() => {
        const storedModel = localStorage.getItem('chatModel');
        if (storedModel) {
            setCurrentModel(storedModel);
        }
    }, []);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.text,
                    model: currentModel
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Determine response text based on format (ollama usually returns 'response', gemini logic we added returns 'response' too)
                const text = data.response;
                const botMessage = { text: text, sender: currentModel };
                setMessages((prev) => [...prev, botMessage]);
            } else {
                const errorMessage = { text: "Error: " + (data.error || "Failed to fetch response"), sender: 'system' };
                setMessages((prev) => [...prev, errorMessage]);
            }
        } catch (error) {
            const errorMessage = { text: "Network error: " + error.message, sender: 'system' };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerTitle}>
                    <h2>Chat</h2>
                    <span style={styles.modelBadge}>{currentModel === 'ollama' ? 'Llama 3.2:1b' : 'Gemini'}</span>
                </div>
                <div>
                    <button onClick={onOpenSettings} style={styles.settingsBtn}>Settings</button>
                    <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
                </div>
            </div>

            <div style={styles.chatWindow}>
                {messages.map((msg, index) => (
                    <div key={index} style={{
                        ...styles.message,
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        backgroundColor: msg.sender === 'user' ? '#0095f6' : (msg.sender === 'system' ? '#ffcccc' : '#e0e0e0'),
                        color: msg.sender === 'user' ? 'white' : 'black',
                    }}>
                        <strong>{msg.sender === 'user' ? 'You' : (msg.sender === 'ollama' || msg.sender === 'gemini' ? 'AI' : 'System')}:</strong> {msg.text}
                    </div>
                ))}
                {isLoading && <div style={styles.loading}>{currentModel} is thinking...</div>}
            </div>

            <form onSubmit={sendMessage} style={styles.inputArea}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message ${currentModel}...`}
                    style={styles.input}
                    disabled={isLoading}
                />
                <button type="submit" style={styles.sendBtn} disabled={isLoading}>Send</button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        maxWidth: '600px',
        margin: '20px auto',
        border: '1px solid #dbdbdb',
        borderRadius: '3px',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        height: '600px',
    },
    header: {
        padding: '10px 20px',
        borderBottom: '1px solid #dbdbdb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    modelBadge: {
        fontSize: '12px',
        backgroundColor: '#fafafa',
        border: '1px solid #dbdbdb',
        padding: '2px 5px',
        borderRadius: '4px',
        color: '#8e8e8e',
    },
    settingsBtn: {
        background: 'none',
        border: 'none',
        color: '#0095f6',
        fontWeight: '600',
        marginRight: '15px',
        cursor: 'pointer',
    },
    logoutBtn: {
        background: 'none',
        border: '1px solid #dbdbdb',
        padding: '5px 10px',
        cursor: 'pointer',
        borderRadius: '3px',
    },
    chatWindow: {
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    message: {
        maxWidth: '70%',
        padding: '10px',
        borderRadius: '8px',
        wordWrap: 'break-word',
    },
    loading: {
        alignSelf: 'flex-start',
        color: '#8e8e8e',
        fontStyle: 'italic',
    },
    inputArea: {
        padding: '10px',
        borderTop: '1px solid #dbdbdb',
        display: 'flex',
        gap: '10px',
    },
    input: {
        flex: 1,
        padding: '8px',
        border: '1px solid #dbdbdb',
        borderRadius: '3px',
        outline: 'none',
    },
    sendBtn: {
        padding: '8px 15px',
        backgroundColor: '#0095f6',
        color: 'white',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer',
        fontWeight: '600',
    }
};

export default Chat;
