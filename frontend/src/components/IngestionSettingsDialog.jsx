import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const IngestionSettingsDialog = ({ isOpen, onClose, currentSettings, onSave }) => {
    const { t } = useTranslation();
    const [chunkSize, setChunkSize] = useState(1000);
    const [chunkOverlap, setChunkOverlap] = useState(200);

    useEffect(() => {
        if (isOpen && currentSettings) {
            setChunkSize(currentSettings.chunkSize);
            setChunkOverlap(currentSettings.chunkOverlap);
        }
    }, [isOpen, currentSettings]);

    const handleSave = () => {
        onSave({
            chunkSize: Number(chunkSize),
            chunkOverlap: Number(chunkOverlap)
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                backgroundColor: '#fff',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
                animation: 'slideUp 0.3s ease-out',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingRight: '60px' // Space for close button
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#111' }}>
                        {t('ingestion.title')}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1.5rem',
                            right: '1.5rem',
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            color: '#666',
                            cursor: 'pointer',
                            padding: 0,
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                            {t('ingestion.chunk_size')}
                        </label>
                        <input
                            type="number"
                            value={chunkSize}
                            onChange={(e) => setChunkSize(e.target.value)}
                            style={{
                                padding: '10px',
                                border: '1px solid #dbdbdb',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                            {t('ingestion.chunk_overlap')}
                        </label>
                        <input
                            type="number"
                            value={chunkOverlap}
                            onChange={(e) => setChunkOverlap(e.target.value)}
                            style={{
                                padding: '10px',
                                border: '1px solid #dbdbdb',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                </div>

                <div style={{
                    padding: '1.5rem 2rem',
                    backgroundColor: '#fafafa',
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem'
                }}>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '10px 24px',
                            backgroundColor: '#0095f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '25px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                        }}
                    >
                        {t('common.save') || "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IngestionSettingsDialog;
