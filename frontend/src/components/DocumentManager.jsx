
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VectorViewer from './VectorViewer';
import { useTranslation } from 'react-i18next';

import IngestionSettingsDialog from './IngestionSettingsDialog';

const DocumentManager = ({ user }) => {
    const { t } = useTranslation();
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewingFile, setViewingFile] = useState(null);
    const [chunks, setChunks] = useState([]);
    const [chunksLoading, setChunksLoading] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Ingestion Settings State
    const [ingestSettings, setIngestSettings] = useState(() => {
        const saved = localStorage.getItem('ingestSettings');
        return saved ? JSON.parse(saved) : { chunkSize: 1000, chunkOverlap: 200 };
    });
    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, [page, limit]);

    // Save settings when changed
    useEffect(() => {
        localStorage.setItem('ingestSettings', JSON.stringify(ingestSettings));
    }, [ingestSettings]);

    const fetchDocuments = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/documents?username=${user.username}&page=${page}&limit=${limit}`);
            if (response.data.documents) {
                setDocuments(response.data.documents);
                setTotalDocs(response.data.total);
                setTotalPages(response.data.total_pages);
            } else {
                // Fallback for legacy response or edge cases
                setDocuments(response.data);
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
            setMessage({ type: 'error', text: 'Failed to load documents' });
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const [progress, setProgress] = useState([]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setMessage(null);
        setProgress([]); // Clear previous progress

        const formData = new FormData();
        formData.append('file', file);
        formData.append('username', user.username);
        // Pass ingestion settings
        formData.append('chunk_size', ingestSettings.chunkSize);
        formData.append('chunk_overlap', ingestSettings.chunkOverlap);

        try {
            const response = await fetch('http://localhost:5000/api/documents', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Upload failed';
                try {
                    // Try to parse JSON error if possible
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorJson.message || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                // Process all complete lines
                buffer = lines.pop(); // Keep the incomplete line in buffer

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const update = JSON.parse(line);
                        if (update.status === 'info') {
                            setProgress(prev => [...prev, update.message]);
                        } else if (update.status === 'success') {
                            setMessage({ type: 'success', text: update.message });
                            setFile(null);
                            document.getElementById('file-upload').value = '';
                            fetchDocuments();
                        } else if (update.status === 'error') {
                            setMessage({ type: 'error', text: update.message });
                        }
                    } catch (err) {
                        console.error("Error parsing stream:", err);
                    }
                }
            }
        } catch (error) {
            console.error("Upload error:", error);
            setMessage({ type: 'error', text: error.message || 'Upload failed' });
        } finally {
            setUploading(false);
        }
    };

    const handleReingest = async (doc) => {
        if (!window.confirm(t('documents.confirm_reingest'))) return;

        setUploading(true);
        setMessage(null);
        setProgress([]);

        const formData = new FormData();
        formData.append('username', user.username);
        formData.append('chunk_size', ingestSettings.chunkSize);
        formData.append('chunk_overlap', ingestSettings.chunkOverlap);

        try {
            const response = await fetch(`http://localhost:5000/api/documents/${doc.id}/reingest`, {
                method: 'POST',
                body: formData,
            });
            await processStream(response);
        } catch (error) {
            console.error("Re-ingest error:", error);
            setMessage({ type: 'error', text: error.message || 'Re-ingest failed' });
        } finally {
            setUploading(false);
            fetchDocuments();
        }
    };

    const handleReingestAll = async () => {
        if (!window.confirm(t('documents.confirm_reingest_all'))) return;

        setUploading(true);
        setMessage(null);
        setProgress([]);

        const formData = new FormData();
        formData.append('username', user.username);
        formData.append('chunk_size', ingestSettings.chunkSize);
        formData.append('chunk_overlap', ingestSettings.chunkOverlap);

        try {
            const response = await fetch(`http://localhost:5000/api/documents/reingest-all`, {
                method: 'POST',
                body: formData,
            });
            await processStream(response);
        } catch (error) {
            console.error("Re-ingest ALL error:", error);
            setMessage({ type: 'error', text: error.message || 'Re-ingest All failed' });
        } finally {
            setUploading(false);
            fetchDocuments();
        }
    };

    const processStream = async (response) => {
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Request failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const update = JSON.parse(line);
                    if (update.status === 'info') {
                        setProgress(prev => [...prev, update.message]);
                        // Auto-scroll to bottom
                        const logDiv = document.getElementById('progress-log');
                        if (logDiv) logDiv.scrollTop = logDiv.scrollHeight;
                    } else if (update.status === 'success') {
                        if (update.message.includes('Completed re-ingestion')) {
                            setMessage({ type: 'success', text: update.message });
                        }
                    } else if (update.status === 'error') {
                        setMessage({ type: 'error', text: update.message });
                    }
                } catch (err) {
                    console.error("Error parsing stream:", err);
                }
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/documents/${id}?username=${user.username}`);
            setMessage({ type: 'success', text: 'Document deleted' });
            fetchDocuments();
        } catch (error) {
            console.error("Delete error:", error);
            setMessage({ type: 'error', text: 'Failed to delete document' });
        }
    };

    const handleDescriptionUpdate = async (id, newDescription) => {
        try {
            await axios.put(`http://localhost:5000/api/documents/${id}?username=${user.username}`, {
                description: newDescription
            });
            fetchDocuments(); // Refresh list to show new description

            // If the updated document is currently being viewed, update its state too
            if (viewingFile && viewingFile.id === id) {
                setViewingFile(prev => ({ ...prev, description: newDescription }));
            }

            setMessage({ type: 'success', text: t('documents.success_update') });
        } catch (error) {
            console.error("Update error:", error);
            setMessage({ type: 'error', text: t('documents.fail_update') });
        }
    };

    const handleViewChunks = async (doc) => {
        setViewingFile(doc); // Store whole doc object instead of just filename
        setViewerOpen(true);
        setChunksLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/documents/${doc.id}/chunks?username=${user.username}`);
            setChunks(response.data);
        } catch (error) {
            console.error("Error fetching chunks:", error);
            setMessage({ type: 'error', text: 'Failed to fetch vector chunks' });
        } finally {
            setChunksLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
                fontSize: '1.5rem',
                marginBottom: '1.5rem',
                color: '#262626',
                fontWeight: '300'
            }}>Document Management</h2>

            {/* Upload Section */}
            <div className="insta-card" style={{ alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }}>
                    <h3 style={{ fontSize: '16px', margin: 0, fontWeight: '600' }}>{t('documents.upload_title')}</h3>

                    {/* Ingestion Settings Display */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#666' }}>
                        <span>
                            {t('ingestion.current_config', { size: ingestSettings.chunkSize, overlap: ingestSettings.chunkOverlap })}
                        </span>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                                onClick={() => setSettingsOpen(true)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #dbdbdb',
                                    borderRadius: '4px',
                                    padding: '2px 8px',
                                    cursor: 'pointer',
                                    color: '#0095f6',
                                    fontSize: '11px'
                                }}
                            >
                                {t('ingestion.btn_config')}
                            </button>
                            <button
                                onClick={handleReingestAll}
                                disabled={uploading}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #dbdbdb',
                                    borderRadius: '4px',
                                    padding: '2px 8px',
                                    cursor: uploading ? 'not-allowed' : 'pointer',
                                    color: uploading ? '#ccc' : '#ed4956',
                                    fontSize: '11px',
                                    fontWeight: '600'
                                }}
                                title={t('documents.confirm_reingest_all')}
                            >
                                {t('documents.btn_reingest_all')}
                            </button>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                    <input
                        id="file-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        style={{ padding: '8px', border: '1px solid #dbdbdb', borderRadius: '4px', flex: 1 }}
                    />
                    <button
                        type="submit"
                        disabled={!file || uploading}
                        className="insta-btn"
                        style={{ margin: 0, height: 'auto', padding: '8px 16px' }}
                    >
                        {uploading ? t('documents.btn_uploading') : t('documents.btn_upload')}
                    </button>
                </form>
                {message && (
                    <div style={{ marginTop: '1rem', width: '100%', fontSize: '14px', color: message.type === 'error' ? '#ed4956' : '#0095f6' }}>
                        {message.text}
                    </div>
                )}

                {/* Progress Log */}
                {progress.length > 0 && (
                    <div id="progress-log" style={{
                        marginTop: '1rem',
                        width: '100%',
                        maxHeight: '150px',
                        overflowY: 'auto',
                        background: '#fafafa',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #dbdbdb',
                        fontSize: '12px',
                        color: '#666',
                        fontFamily: 'monospace'
                    }}>
                        {progress.map((msg, idx) => (
                            <div key={idx}>{msg}</div>
                        ))}
                        {uploading && <div>...</div>}
                    </div>
                )}
            </div>

            {/* Document List */}
            <div className="insta-card" style={{ padding: '0', alignItems: 'stretch' }}>
                <div style={{
                    padding: '1rem',
                    margin: 0,
                    borderBottom: '1px solid #dbdbdb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>{t('documents.list_title')}</h3>
                    <span style={{ fontSize: '14px', color: '#8e8e8e' }}>{t('documents.total_count', { count: totalDocs })}</span>
                </div>
                {documents.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#8e8e8e' }}>{t('documents.no_documents')}</div>
                ) : (
                    <>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {documents.map(doc => (
                                <li key={doc.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    borderBottom: '1px solid #dbdbdb'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#262626' }}>{doc.filename}</div>
                                        <div style={{ fontSize: '12px', color: '#8e8e8e', cursor: 'pointer' }}
                                            onClick={() => {
                                                const newDesc = prompt(t('documents.prompt_new_desc'), doc.description || "");
                                                if (newDesc !== null) handleDescriptionUpdate(doc.id, newDesc);
                                            }}
                                            title={t('documents.click_to_edit')}
                                        >
                                            {doc.description ? doc.description : <i>{t('documents.no_description')} ({t('documents.click_to_add')})</i>}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#c7c7c7' }}>{new Date(doc.created_at).toLocaleString()}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleViewChunks(doc)}
                                            className="insta-btn"
                                            style={{ margin: 0, padding: '4px 12px', fontSize: '12px', background: 'transparent', color: '#0095f6', border: '1px solid #dbdbdb', height: 'auto' }}
                                        >
                                            {t('documents.btn_view_vectors')}
                                        </button>
                                        <button
                                            onClick={() => handleReingest(doc)}
                                            disabled={uploading}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid #dbdbdb',
                                                borderRadius: '4px',
                                                padding: '4px 12px',
                                                cursor: uploading ? 'not-allowed' : 'pointer',
                                                color: uploading ? '#ccc' : '#0095f6',
                                                fontSize: '12px',
                                                display: 'flex', // ensure it takes width
                                                alignItems: 'center'
                                            }}
                                            title={t('documents.confirm_reingest')}
                                        >
                                            {t('documents.btn_reingest')}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            style={{
                                                background: 'transparent',
                                                color: '#ed4956',
                                                border: 'none',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            {t('documents.btn_delete')}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {/* Pagination Footer */}
                        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#666' }}>
                                <span>{t('documents.rows_per_page')}</span>
                                <select
                                    value={limit}
                                    onChange={(e) => {
                                        setLimit(Number(e.target.value));
                                        setPage(1); // Reset to first page on limit change
                                    }}
                                    style={{ padding: '4px', borderRadius: '4px', border: '1px solid #dbdbdb' }}
                                >
                                    {[10, 20, 50, 100].map(val => (
                                        <option key={val} value={val}>{val}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button
                                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    style={{
                                        padding: '4px 12px',
                                        border: '1px solid #dbdbdb',
                                        background: page === 1 ? '#f0f0f0' : 'white',
                                        borderRadius: '4px',
                                        cursor: page === 1 ? 'not-allowed' : 'pointer',
                                        color: page === 1 ? '#ccc' : '#333'
                                    }}
                                >
                                    &lt;
                                </button>
                                <span style={{ fontSize: '14px', color: '#666' }}>
                                    {t('documents.page_info', { current: page, total: totalPages })}
                                </span>
                                <button
                                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={page === totalPages || totalPages === 0}
                                    style={{
                                        padding: '4px 12px',
                                        border: '1px solid #dbdbdb',
                                        background: (page === totalPages || totalPages === 0) ? '#f0f0f0' : 'white',
                                        borderRadius: '4px',
                                        cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                                        color: (page === totalPages || totalPages === 0) ? '#ccc' : '#333'
                                    }}
                                >
                                    &gt;
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <VectorViewer
                isOpen={viewerOpen}
                onClose={() => setViewerOpen(false)}
                document={viewingFile}
                onDescriptionUpdate={handleDescriptionUpdate}
                chunks={chunks}
                loading={chunksLoading}
            />

            <IngestionSettingsDialog
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                currentSettings={ingestSettings}
                onSave={setIngestSettings}
            />
        </div>
    );
};

export default DocumentManager;

