import React from 'react';

const VectorViewer = ({ isOpen, onClose, filename, chunks, loading }) => {
    if (!isOpen) return null;

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
                padding: '0'
            }}>
                <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid #dbdbdb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>Vector Chunks: {filename}</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#fafafa' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading chunks from Vector DB...</div>
                    ) : chunks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>No chunks found for this file.</div>
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
