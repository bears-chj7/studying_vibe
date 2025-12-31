import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VectorViewer from './VectorViewer';
import { useTranslation } from 'react-i18next';

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

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/documents?username=${user.username}`);
            setDocuments(response.data);
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

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('username', user.username);

        try {
            const response = await axios.post('http://localhost:5000/api/documents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage({ type: 'success', text: response.data.message || 'Upload successful' });
            setFile(null);
            document.getElementById('file-upload').value = '';
            fetchDocuments();
        } catch (error) {
            console.error("Upload error:", error);
            setMessage({ type: 'error', text: error.response?.data?.error || 'Upload failed' });
        } finally {
            setUploading(false);
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

    const handleViewChunks = async (doc) => {
        setViewingFile(doc.filename);
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
                <h3 style={{ fontSize: '16px', marginBottom: '1rem', fontWeight: '600' }}>{t('documents.upload_title')}</h3>
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
            </div>

            {/* Document List */}
            <div className="insta-card" style={{ padding: '0', alignItems: 'stretch' }}>
                <h3 style={{ padding: '1rem', margin: 0, borderBottom: '1px solid #dbdbdb', fontSize: '16px', fontWeight: '600' }}>{t('documents.list_title')}</h3>
                {documents.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#8e8e8e' }}>{t('documents.no_documents')}</div>
                ) : (
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
                                    <div style={{ fontSize: '12px', color: '#8e8e8e' }}>{new Date(doc.created_at).toLocaleString()}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleViewChunks(doc)}
                                        className="insta-btn"
                                        style={{ margin: 0, padding: '4px 12px', fontSize: '12px', background: 'transparent', color: '#0095f6', border: '1px solid #dbdbdb' }}
                                    >
                                        {t('documents.btn_view_vectors')}
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
                )}
            </div>

            <VectorViewer
                isOpen={viewerOpen}
                onClose={() => setViewerOpen(false)}
                filename={viewingFile}
                chunks={chunks}
                loading={chunksLoading}
            />
        </div>
    );
};

export default DocumentManager;
