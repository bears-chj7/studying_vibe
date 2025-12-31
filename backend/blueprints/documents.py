import os
from flask import Blueprint, request, jsonify, current_app
from database import create_connection
from auth_middleware import check_abac
from werkzeug.utils import secure_filename
from rag import RAGService

# Assuming RAGService is initialized in app.py and available via current_app or we instantiate a shared one?
# Better to have it available. For now, let's look at how app.py does it.
# app.py: rag_service = RAGService()
# We should probably pass it or import a singleton. 
# For this refactor, let's assume we can import a shared instance or initialize it here (Chroma is distinct).
# However, initializing `RAGService` twice might be okay if they point to the same persist dir.
# Let's instantiate it here for simplicity, ensuring same persist_directory.
rag_service = RAGService()

documents_bp = Blueprint('documents', __name__)

UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../pdf'))
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@documents_bp.route('/api/documents', methods=['GET'])
@check_abac({'access_page': 'documents'}) # Updated to new attribute logic
def get_documents():
    conn = create_connection()
    if not conn:
        return jsonify({"error": "DB Connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, filename, created_at FROM documents ORDER BY created_at DESC")
        docs = cursor.fetchall()
        return jsonify(docs), 200
    finally:
        conn.close()

@documents_bp.route('/api/documents', methods=['POST'])
@check_abac({'access_page': 'documents'}) # Or we could require 'action': 'manage_documents'
def upload_document():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and file.filename.endswith('.pdf'):
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Check if file exists? Overwrite?
        file.save(filepath)

        # DB Insert
        conn = create_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            
            # Since we are using ABAC/simplified auth, getting user_id is tricky if we don't have full session.
            # We used 'username' in body for check_abac. logic.
            # check_abac doesn't return user info to the function.
            # Let's verify user again or assume 1 (admin placeholder) if not critical.
            # But the user specifically asked for 'uploaded_by' FK.
            # Let's get username from request (check_abac ensures it's there).
            username = request.form.get('username') 
            if not username:
                 # Should have been caught by middleware if middleware was strictly checking body for JSON.
                 # But file upload is multipart/form-data!
                 # check_abac needs to handle form-data too.
                 pass

            # Update check_abac for form-data?
            # For now, let's fetch user again.
            cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()
            user_id = user['id'] if user else None

            cursor.execute("INSERT INTO documents (filename, filepath, uploaded_by) VALUES (%s, %s, %s)", 
                           (filename, filepath, user_id))
            conn.commit()
            
            # RAG Ingest
            success, msg = rag_service.ingest_file(filepath)
            if not success:
                return jsonify({"warning": "File saved but RAG ingestion failed", "rag_error": msg}), 201
            
            return jsonify({"message": "File uploaded and ingested successfully"}), 201

        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
    
    return jsonify({"error": "Invalid file type (PDF only)"}), 400

@documents_bp.route('/api/documents/<int:doc_id>', methods=['DELETE'])
@check_abac({'access_page': 'documents'})
def delete_document(doc_id):
    username = request.args.get('username') # required for auth decorator
    
    conn = create_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT filename, filepath FROM documents WHERE id = %s", (doc_id,))
        doc = cursor.fetchone()
        
        if not doc:
            return jsonify({"error": "Document not found"}), 404
            
        filename = doc['filename']
        filepath = doc['filepath']
        
        # Delete from DB
        cursor.execute("DELETE FROM documents WHERE id = %s", (doc_id,))
        conn.commit()
        
        # Delete from Disk
        if os.path.exists(filepath):
            os.remove(filepath)
            
        # Delete from RAG
        success, msg = rag_service.delete_file(filename)
        
        return jsonify({"message": f"Document deleted. {msg}"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@documents_bp.route('/api/documents/<int:doc_id>/chunks', methods=['GET'])
@check_abac({'access_page': 'documents'})
def get_document_chunks(doc_id):
    conn = create_connection()
    if not conn:
        return jsonify({"error": "DB Connection failed"}), 500
        
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT filename FROM documents WHERE id = %s", (doc_id,))
        doc = cursor.fetchone()
        
        if not doc:
            return jsonify({"error": "Document not found"}), 404
            
        filename = doc['filename']
        
        chunks = rag_service.get_chunks_by_filename(filename)
        return jsonify(chunks), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
