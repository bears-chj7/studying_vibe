import React from 'react';
import { useTranslation } from 'react-i18next';

const VectorViewer = ({ isOpen, onClose, document, onDescriptionUpdate, chunks, loading }) => {
    const { t } = useTranslation();
    if (!isOpen || !document) return null;

    const { filename, description, id } = document;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="insta-card" style={{
                width: '80%',
                maxWidth: '800px',
                height: '80vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
                padding: '0'
            }}>
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    paddingRight: '100px' // Ensure space for the close button
                }}>
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
                        title={t('common.close') || "Close"}
                    >
                        ×
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#111' }}>
                            {t('vector_viewer.title', { filename })}
                        </h3>
                        <div style={{ fontSize: '14px', color: '#8e8e8e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{description || t('documents.no_description')}</span>
                            <button
                                onClick={() => {
                                    const newDesc = prompt(t('documents.prompt_new_desc'), description || "");
                                    if (newDesc !== null) onDescriptionUpdate(id, newDesc);
                                }}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #dbdbdb',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    color: '#0095f6'
                                }}
                            >
                                {t('documents.btn_edit')}
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#fafafa' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>{t('vector_viewer.loading')}</div>
                    ) : chunks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>{t('vector_viewer.no_chunks')}</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {chunks.map((chunk, idx) => (
                                <div key={chunk.id} style={{
                                    background: 'white',
                                    border: '1px solid #dbdbdb',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}>
                                    <div style={{
                                        fontSize: '11px',
                                        color: '#8e8e8e',
                                        marginBottom: '0.5rem',
                                        fontFamily: 'monospace',
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span>ID: {chunk.id}</span>
                                        <span>Index: {idx}</span>
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        color: '#262626',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {chunk.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VectorViewer;
