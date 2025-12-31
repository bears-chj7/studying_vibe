import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Settings = ({ onBack }) => {
    const { t, i18n } = useTranslation();
    const [selectedModel, setSelectedModel] = useState('ollama');
    const [language, setLanguage] = useState(i18n.language || 'en');

    useEffect(() => {
        const storedModel = localStorage.getItem('chatModel');
        if (storedModel) {
            setSelectedModel(storedModel);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('chatModel', selectedModel);
        i18n.changeLanguage(language);
        onBack();
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>{t('settings.title')}</h2>
                    <button onClick={onBack} style={styles.closeBtn}>×</button>
                </div>

                <div style={styles.content}>
                    {/* Language Section */}
                    <div style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h3 style={styles.sectionTitle}>{t('settings.language', 'Language')}</h3>
                            <p style={styles.sectionDesc}>Choose your preferred language for the interface.</p>
                        </div>
                        <div style={styles.optionGroup}>
                            <label style={{ ...styles.optionLabel, ...(language === 'en' ? styles.activeOption : {}) }}>
                                <input
                                    type="radio"
                                    name="language"
                                    value="en"
                                    checked={language === 'en'}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    style={styles.radio}
                                />
                                English
                            </label>
                            <label style={{ ...styles.optionLabel, ...(language === 'ko' ? styles.activeOption : {}) }}>
                                <input
                                    type="radio"
                                    name="language"
                                    value="ko"
                                    checked={language === 'ko'}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    style={styles.radio}
                                />
                                한국어
                            </label>
                        </div>
                    </div>

                    {/* Model Section */}
                    <div style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h3 style={styles.sectionTitle}>{t('settings.model_selection')}</h3>
                            <p style={styles.sectionDesc}>Select the AI model that powers your chat experience.</p>
                        </div>
                        <div style={styles.optionGroup}>
                            <label style={{ ...styles.optionLabel, ...(selectedModel === 'ollama' ? styles.activeOption : {}) }}>
                                <input
                                    type="radio"
                                    name="model"
                                    value="ollama"
                                    checked={selectedModel === 'ollama'}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    style={styles.radio}
                                />
                                Ollama (Llama 3.2:1b)
                            </label>
                            <label style={{ ...styles.optionLabel, ...(selectedModel === 'gemini' ? styles.activeOption : {}) }}>
                                <input
                                    type="radio"
                                    name="model"
                                    value="gemini"
                                    checked={selectedModel === 'gemini'}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    style={styles.radio}
                                />
                                Gemini API
                            </label>
                        </div>
                    </div>
                </div>

                <div style={styles.footer}>
                    <button onClick={onBack} style={styles.cancelBtn}>{t('settings.btn_back', 'Cancel')}</button>
                    <button onClick={handleSave} style={styles.saveBtn}>{t('settings.btn_save', 'Save')}</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)',
    },
    container: {
        width: '100%',
        maxWidth: '500px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease-out',
    },
    header: {
        padding: '1.5rem 2rem',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        margin: 0,
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#111',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        color: '#666',
        cursor: 'pointer',
    },
    content: {
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    sectionHeader: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    sectionTitle: {
        margin: 0,
        fontSize: '1rem',
        fontWeight: '600',
        color: '#333',
    },
    sectionDesc: {
        margin: 0,
        fontSize: '0.875rem',
        color: '#666',
    },
    optionGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    optionLabel: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start', // Ensure left alignment
        width: '100%', // Ensure full width
        gap: '10px',
        padding: '10px 15px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '0.95rem',
        color: '#333',
    },
    activeOption: {
        borderColor: '#0095f6',
        backgroundColor: '#f0f9ff',
        color: '#0095f6',
        fontWeight: '500',
    },
    radio: {
        accentColor: '#0095f6',
        width: 'auto',      // Override global width: 100%
        margin: 0,          // Reset margin
        padding: 0,         // Reset padding
    },
    footer: {
        padding: '1.5rem 2rem',
        backgroundColor: '#fafafa',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
    },
    cancelBtn: {
        padding: '10px 20px',
        border: 'none',
        background: 'transparent',
        color: '#666',
        fontSize: '0.95rem',
        fontWeight: '500',
        cursor: 'pointer',
    },
    saveBtn: {
        padding: '10px 24px',
        backgroundColor: '#0095f6',
        color: 'white',
        border: 'none',
        borderRadius: '25px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 6px -1px rgba(0, 149, 246, 0.2)',
        transition: 'transform 0.1s',
    },
};

export default Settings;
