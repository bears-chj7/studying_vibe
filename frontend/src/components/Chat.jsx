import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const Chat = ({ onLogout, onOpenSettings }) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentModel, setCurrentModel] = useState('ollama');

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const storedModel = localStorage.getItem('chatModel');
        if (storedModel) {
            setCurrentModel(storedModel);
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
                    <h2>{t('chat.title')}</h2>
                    <span style={styles.modelBadge}>{t('chat.model_display', { model: currentModel === 'ollama' ? 'Llama 3.2:1b' : 'Gemini' })}</span>
                </div>
                <div>
                    <button onClick={onOpenSettings} style={styles.settingsBtn}>{t('sidebar.menu_settings')}</button>
                    <button onClick={onLogout} style={styles.logoutBtn}>{t('sidebar.btn_logout')}</button>
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
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={styles.inputArea}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('chat.placeholder_message')}
                    style={styles.input}
                    disabled={isLoading}
                />
                <button type="submit" style={styles.sendBtn} disabled={isLoading}>{t('chat.btn_send')}</button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        // Removed borders and rounded corners for full-screen feel, or keep them if it's a "card"
        // Let's make it fill the parent container (which is now full width)
        position: 'relative',
    },
    header: {
        padding: '1.5rem 2rem',
        borderBottom: '1px solid #efefef',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
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
        padding: '2rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        backgroundColor: '#fafafa',
    },
    message: {
        maxWidth: '80%', // Slightly wider
        padding: '12px 18px',
        borderRadius: '20px', // More rounded bubble look
        lineHeight: '1.5',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        fontSize: '15px',
    },
    loading: {
        alignSelf: 'flex-start',
        color: '#8e8e8e',
        fontStyle: 'italic',
    },
    inputArea: {
        padding: '1.5rem',
        borderTop: '1px solid #efefef',
        display: 'flex',
        gap: '1rem',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        padding: '14px',
        border: '1px solid #dbdbdb',
        borderRadius: '25px', // Pill shape
        outline: 'none',
        fontSize: '15px',
        backgroundColor: '#fafafa',
    },
    sendBtn: {
        padding: '12px 24px',
        backgroundColor: '#0095f6',
        color: 'white',
        border: 'none',
        borderRadius: '25px', // Pill shape
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        transition: 'background-color 0.2s',
    }
};

export default Chat;
